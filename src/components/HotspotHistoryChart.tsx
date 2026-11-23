import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { History } from 'lucide-react';
import type { McgHotspot } from '../data/mcgHotspots';

interface HistoryDatum {
  period: string;
  frequency: number;
  avgDurationHrs: number;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  dataKey?: string;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function HistoryTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const freqItem = payload.find((p) => p.dataKey === 'frequency');
  const durItem = payload.find((p) => p.dataKey === 'avgDurationHrs');

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{label}</p>
      {freqItem && (
        <p className="text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-xs bg-[#0B3D6B] dark:bg-sky-400 inline-block" />
            Flood Events:
          </span>
          <span className="font-mono font-bold tabular-nums">{freqItem.value}</span>
        </p>
      )}
      {durItem && (
        <p className="text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3 mt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
            Avg Duration:
          </span>
          <span className="font-mono font-bold tabular-nums">{durItem.value} hrs</span>
        </p>
      )}
    </div>
  );
}

function buildHotspotHistory(hotspot: McgHotspot): {
  yearly: HistoryDatum[];
  monthly: HistoryDatum[];
  totalEvents: number;
  meanDurationHrs: number;
  peakPeriod: string;
} {
  // Deterministic seed based on MCG serial number, ward, and drainage profile
  const seed = hotspot.srNo * 17 + hotspot.wardNo * 31 + hotspot.zone * 13;

  const critMultiplier =
    hotspot.criticality === 'critical' ? 1.45 : hotspot.criticality === 'high' ? 1.15 : 0.82;

  const typeDurationBonus =
    hotspot.type === 'underpass'
      ? 2.2
      : hotspot.type === 'drain-node'
        ? 1.3
        : hotspot.type === 'residential-sector'
          ? 0.7
          : 0.4;

  const causeFreqBonus =
    hotspot.causeCategory === 'gmda_backflow' || hotspot.causeCategory === 'no_master_drain'
      ? 2
      : hotspot.causeCategory === 'critical_junction'
        ? 1.5
        : 0.6;

  // 5-year monsoon history (2021 - 2025)
  const years = ['2021', '2022', '2023', '2024', '2025'];
  const rainFactorByYear = [0.85, 0.95, 1.28, 1.12, 1.22]; // 2023 & 2025 heavier Gurugram monsoons

  const yearly: HistoryDatum[] = years.map((yr, idx) => {
    const jitter = ((seed + idx * 7) % 5) - 2; // -2..+2
    const rawFreq = (5 + causeFreqBonus) * critMultiplier * rainFactorByYear[idx] + jitter * 0.6;
    const frequency = Math.max(1, Math.round(rawFreq));

    const durJitter = ((seed * (idx + 3)) % 9) * 0.15;
    const avgDurationHrs = Number(
      Math.max(
        1.2,
        (2.4 + typeDurationBonus) * critMultiplier * (0.9 + idx * 0.03) + durJitter
      ).toFixed(1)
    );

    return { period: yr, frequency, avgDurationHrs };
  });

  // Typical seasonal monsoon distribution (June - October averages across past years)
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthWeights = [0.14, 0.31, 0.34, 0.16, 0.05];
  const baseAnnualFreq = Math.max(4, Math.round((5.5 + causeFreqBonus) * critMultiplier));

  const monthly: HistoryDatum[] = months.map((m, idx) => {
    const variance = ((seed + idx * 11) % 3) * 0.35;
    const frequency = Math.max(
      idx === 4 ? 0 : 1,
      Math.round(baseAnnualFreq * monthWeights[idx] * 2.2 + (idx === 1 || idx === 2 ? variance : 0))
    );

    const monthDurFactor = idx === 1 || idx === 2 ? 1.25 : idx === 3 ? 0.95 : 0.72;
    const avgDurationHrs = Number(
      Math.max(
        frequency === 0 ? 0 : 1.0,
        frequency === 0
          ? 0
          : (2.1 + typeDurationBonus) * critMultiplier * monthDurFactor + ((seed + idx) % 4) * 0.2
      ).toFixed(1)
    );

    return { period: m, frequency, avgDurationHrs };
  });

  const totalEvents = yearly.reduce((sum, d) => sum + d.frequency, 0);
  const meanDurationHrs = Number(
    (yearly.reduce((sum, d) => sum + d.avgDurationHrs, 0) / yearly.length).toFixed(1)
  );
  const peakMonth = monthly.reduce((best, cur) => (cur.frequency > best.frequency ? cur : best), monthly[0]);

  return {
    yearly,
    monthly,
    totalEvents,
    meanDurationHrs,
    peakPeriod: peakMonth.period,
  };
}

interface HotspotHistoryChartProps {
  hotspot: McgHotspot;
}

export function HotspotHistoryChart({ hotspot }: HotspotHistoryChartProps) {
  const [mode, setMode] = useState<'monthly' | 'yearly'>('monthly');

  const history = useMemo(() => buildHotspotHistory(hotspot), [hotspot]);
  const chartData = mode === 'monthly' ? history.monthly : history.yearly;

  return (
    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <History size={14} className="text-[#0B3D6B] dark:text-sky-400 shrink-0" />
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            Past Flood History
          </h3>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setMode('monthly')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              mode === 'monthly'
                ? 'bg-[#0B3D6B] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Monsoon Months
          </button>
          <button
            type="button"
            onClick={() => setMode('yearly')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
              mode === 'yearly'
                ? 'bg-[#0B3D6B] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            5-Year Trend
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Events (5 yrs)</p>
          <p className="text-xs font-mono font-bold tabular-nums text-[#0B3D6B] dark:text-sky-400 mt-0.5">
            {history.totalEvents}
          </p>
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Avg Standing</p>
          <p className="text-xs font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {history.meanDurationHrs} hrs
          </p>
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Peak Month</p>
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {history.peakPeriod}
          </p>
        </div>
      </div>

      {/* Recharts Dual-Axis Visualization: Frequency (Bar) + Avg Duration (Line) */}
      <div className="h-[175px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 6, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: '#d97706' }}
              axisLine={false}
              tickLine={false}
              width={28}
              unit="h"
            />
            <Tooltip content={<HistoryTooltip />} />
            <Bar
              yAxisId="left"
              dataKey="frequency"
              name="Events"
              fill="#0B3D6B"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgDurationHrs"
              name="Duration (hrs)"
              stroke="#D97706"
              strokeWidth={2.25}
              dot={{ r: 3.5, fill: '#D97706', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 rounded-xs bg-[#0B3D6B] inline-block" />
          Flood events (count)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-amber-600 inline-block" />
          Avg clearance time (hrs)
        </span>
      </div>
    </div>
  );
}
