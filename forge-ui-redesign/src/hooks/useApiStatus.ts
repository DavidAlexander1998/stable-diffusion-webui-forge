import { useState, useEffect } from "react";
import { forgeAPI, type APIError } from "../services/api";

export interface ApiStatus {
  isConnected: boolean;
  hasAPI: boolean;
  error?: string;
  errorType?: "network" | "timeout" | "server" | "no-api" | "unknown";
  lastChecked?: number;
}

const API_CHECK_INTERVAL = 10000; // Check every 10 seconds

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>({
    isConnected: false,
    hasAPI: false,
    error: undefined,
    lastChecked: undefined,
  });

  const checkApiStatus = async () => {
    try {
      const result = await forgeAPI.checkConnection();

      if (result.connected && result.hasAPI) {
        // Fully connected with API enabled
        setStatus({
          isConnected: true,
          hasAPI: true,
          error: undefined,
          errorType: undefined,
          lastChecked: Date.now(),
        });
      } else if (result.connected && !result.hasAPI) {
        // Connected but API not enabled
        setStatus({
          isConnected: true,
          hasAPI: false,
          error:
            "Forge API not enabled. Add --api flag to launch arguments and restart.",
          errorType: "no-api",
          lastChecked: Date.now(),
        });
      } else {
        // Disconnected
        const apiError = result.error as APIError | undefined;
        setStatus({
          isConnected: false,
          hasAPI: false,
          error: apiError?.message || "Cannot connect to Forge backend",
          errorType: apiError?.type || "network",
          lastChecked: Date.now(),
        });
      }
    } catch (error) {
      const apiError = error as APIError;
      setStatus({
        isConnected: false,
        hasAPI: false,
        error: apiError.message || "Connection check failed",
        errorType: apiError.type || "unknown",
        lastChecked: Date.now(),
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
