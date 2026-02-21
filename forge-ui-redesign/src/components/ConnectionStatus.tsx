import { useState, useEffect } from "react";
import { Activity, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { forgeAPI, APIError } from "../services/api";
import "./ConnectionStatus.css";

interface ConnectionStatusProps {
  onStatusChange?: (connected: boolean) => void;
}

export default function ConnectionStatus({
  onStatusChange,
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<
    "checking" | "connected" | "no-api" | "disconnected"
  >("checking");
  const [error, setError] = useState<APIError | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkConnection();
    // Check connection every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const result = await forgeAPI.checkConnection();

      if (result.connected && result.hasAPI) {
        setStatus("connected");
        setError(null);
        onStatusChange?.(true);
      } else if (result.connected && !result.hasAPI) {
        setStatus("no-api");
        setError(result.error || null);
        onStatusChange?.(false);
      } else {
        setStatus("disconnected");
        setError(result.error || null);
        onStatusChange?.(false);
      }
    } catch (err) {
      setStatus("disconnected");
      setError(err as APIError);
      onStatusChange?.(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "checking":
        return <Loader className="connection-icon spin" size={14} />;
      case "connected":
        return <CheckCircle className="connection-icon" size={14} />;
      case "no-api":
      case "disconnected":
        return <AlertCircle className="connection-icon" size={14} />;
      default:
        return <Activity className="connection-icon" size={14} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "checking":
        return "Checking...";
      case "connected":
        return "Connected";
      case "no-api":
        return "API Not Enabled";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case "connected":
        return "status-connected";
      case "no-api":
        return "status-warning";
      case "disconnected":
        return "status-error";
      default:
        return "status-checking";
    }
  };

  return (
    <div className="connection-status-container">
      <button
        className={`connection-status ${getStatusClass()}`}
        onClick={() => setShowDetails(!showDetails)}
        title="Click for connection details"
      >
        {getStatusIcon()}
        <span className="status-text">{getStatusText()}</span>
      </button>

      {showDetails && (
        <div className="connection-details">
          <div className="details-header">
            <h4>Connection Status</h4>
            <button
              className="close-btn"
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
          </div>

          <div className="details-content">
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value ${getStatusClass()}`}>
                {getStatusText()}
              </span>
            </div>

            {status === "no-api" && (
              <>
                <div className="detail-separator" />
                <div className="detail-message warning">
                  <AlertCircle size={16} />
                  <div>
                    <strong>Forge API Not Enabled</strong>
                    <p>
                      The Forge backend is running but the REST API is not
                      enabled.
                    </p>
                  </div>
                </div>
                <div className="detail-instructions">
                  <strong>To enable the API:</strong>
                  <ol>
                    <li>
                      Open <code>webui-user.bat</code> (Windows) or{" "}
                      <code>webui-user.sh</code> (Linux/Mac)
                    </li>
                    <li>
                      Add <code>--api</code> to the command line arguments
                    </li>
                    <li>Restart Stable Diffusion Forge</li>
                    <li>Refresh this page</li>
                  </ol>
                  <p className="note">
                    Example: <code>COMMANDLINE_ARGS=--api --xformers</code>
                  </p>
                </div>
              </>
            )}

            {status === "disconnected" && error && (
              <>
                <div className="detail-separator" />
                <div className="detail-message error">
                  <AlertCircle size={16} />
                  <div>
                    <strong>Cannot Connect to Forge</strong>
                    <p>{error.message}</p>
                  </div>
                </div>
                <div className="detail-instructions">
                  <strong>Troubleshooting:</strong>
                  <ol>
                    <li>Make sure Stable Diffusion Forge is running</li>
                    <li>
                      Check that it's running on the correct port (default:
                      7860)
                    </li>
                    <li>
                      Verify the API URL in <code>.env</code> file matches your
                      setup
                    </li>
                    <li>
                      Restart Forge with the <code>--api</code> flag
                    </li>
                  </ol>
                </div>
              </>
            )}

            {status === "connected" && (
              <>
                <div className="detail-separator" />
                <div className="detail-message success">
                  <CheckCircle size={16} />
                  <div>
                    <strong>Connection Healthy</strong>
                    <p>
                      Successfully connected to Forge API. All features
                      available.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="detail-separator" />
            <button className="retry-btn" onClick={checkConnection}>
              <Activity size={14} />
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
