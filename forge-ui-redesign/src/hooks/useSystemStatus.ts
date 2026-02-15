import { useState, useEffect } from "react";
import { forgeAPI } from "../services/api";

export interface SystemStatus {
  gpuUsage: number; // 0-100 percentage
  gpuMemoryUsed: number; // GB
  gpuMemoryTotal: number; // GB
  queuePending: number;
  queueRunning: number;
  isLoading: boolean;
  error: string | null;
}

const POLL_INTERVAL = 2000; // Poll every 2 seconds

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    gpuUsage: 0,
    gpuMemoryUsed: 0,
    gpuMemoryTotal: 0,
    queuePending: 0,
    queueRunning: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    let timeoutId: number;

    const fetchStatus = async () => {
      try {
        // Fetch memory and queue status in parallel
        const [memoryData, queueData] = await Promise.all([
          forgeAPI.getMemory().catch(() => null),
          forgeAPI.getQueue().catch(() => null),
        ]);

        if (!mounted) return;

        let gpuUsage = 0;
        let gpuMemoryUsed = 0;
        let gpuMemoryTotal = 0;

        // Parse memory data
        if (memoryData && memoryData.cuda) {
          // Get first CUDA device (usually cuda:0)
          const cudaDevice = Object.values(memoryData.cuda)[0];
          if (cudaDevice) {
            gpuMemoryUsed = cudaDevice.used / (1024 * 1024 * 1024); // Convert to GB
            gpuMemoryTotal = cudaDevice.total / (1024 * 1024 * 1024); // Convert to GB
            gpuUsage =
              gpuMemoryTotal > 0 ? (gpuMemoryUsed / gpuMemoryTotal) * 100 : 0;
          }
        }

        // Parse queue data
        let queuePending = 0;
        let queueRunning = 0;

        if (queueData) {
          // Queue data structure varies by implementation
          // Common formats: { pending: [], running: [] } or { queue_pending: N, queue_running: N }
          if ("queue_pending" in queueData) {
            queuePending = queueData.queue_pending || 0;
            queueRunning = queueData.queue_running || 0;
          } else if (
            "pending" in queueData &&
            Array.isArray(queueData.pending)
          ) {
            queuePending = queueData.pending.length;
            queueRunning = queueData.running?.length || 0;
          }
        }

        setStatus({
          gpuUsage: Math.round(gpuUsage),
          gpuMemoryUsed: Math.round(gpuMemoryUsed * 10) / 10, // Round to 1 decimal
          gpuMemoryTotal: Math.round(gpuMemoryTotal * 10) / 10,
          queuePending,
          queueRunning,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (!mounted) return;

        // Don't set error state for expected failures (API not implemented)
        // Just mark as not loading and keep previous values
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      } finally {
        // Schedule next poll
        if (mounted) {
          timeoutId = setTimeout(fetchStatus, POLL_INTERVAL);
        }
      }
    };

    // Start polling
    fetchStatus();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return status;
}
