import { useState, useEffect } from 'react';

export interface ApiStatus {
  isConnected: boolean;
  error?: string;
  lastChecked?: number;
}

const API_CHECK_INTERVAL = 30000; // Check every 30 seconds

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>({
    isConnected: false,
    error: undefined,
    lastChecked: undefined
  });

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:7860/openapi.json', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        // Check if the /sdapi/v1/ endpoints exist
        const paths = data.paths || {};
        const hasSdApi = Object.keys(paths).some((path) => path.startsWith('/sdapi/v1/'));

        setStatus({
          isConnected: hasSdApi,
          error: hasSdApi ? undefined : 'API extension not enabled. Add --api flag to launch args.',
          lastChecked: Date.now()
        });
      } else {
        setStatus({
          isConnected: false,
          error: `Backend returned ${response.status}`,
          lastChecked: Date.now()
        });
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        lastChecked: Date.now()
      });
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkApiStatus();

    // Then check periodically
    const interval = setInterval(checkApiStatus, API_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return status;
}
