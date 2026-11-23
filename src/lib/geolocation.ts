export interface GeolocationFix {
  lat: number;
  lng: number;
  accuracyMeters: number;
  heading?: number | null;
  updatedAt: string;
}

export function getGeolocationErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as GeolocationPositionError).code;
    if (code === 1) {
      return 'Location permission denied — please allow browser location access.';
    }
    if (code === 2) {
      return 'Unable to determine your GPS position right now.';
    }
    if (code === 3) {
      return 'Location request timed out — please try again.';
    }
  }
  return 'Could not fetch your current location.';
}

function toFix(pos: GeolocationPosition): GeolocationFix {
  const heading =
    typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading)
      ? pos.coords.heading
      : null;
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracyMeters: Math.round(pos.coords.accuracy || 25),
    heading,
    updatedAt: new Date(pos.timestamp || Date.now()).toISOString(),
  };
}

export function fetchRealtimePosition(): Promise<GeolocationFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location access is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(toFix(pos)),
      (err) => {
        reject(new Error(getGeolocationErrorMessage(err)));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export function watchRealtimePosition(
  onUpdate: (fix: GeolocationFix) => void,
  onError?: (message: string, code?: number) => void
): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => onUpdate(toFix(pos)),
    (err) => {
      if (onError) onError(getGeolocationErrorMessage(err), err.code);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

