interface DataChipProps {
  type: 'modelled' | 'register';
  className?: string;
}

export function DataChip({ type, className = '' }: DataChipProps) {
  if (type === 'modelled') {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-600 border border-gray-200 ${className}`}>
        modelled
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-50 text-green-700 border border-green-200 ${className}`}>
      MCG register
    </span>
  );
}
