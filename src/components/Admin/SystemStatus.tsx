
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Loader2, Database, Server, Check, X, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

type Status = "online" | "offline" | "loading" | "degraded" | "unknown"

const fetchStatus = async (): Promise<{ server: Status; db: Status }> => {
  // Fake a fetch: in real-world, call health check endpoints
  await new Promise(r => setTimeout(r, 600));
  return { server: "online", db: "online" }
}

const iconFromStatus = (status: Status) => {
  switch (status) {
    case "online":
      return <Check className="text-green-500" />;
    case "offline":
      return <X className="text-red-500" />;
    case "degraded":
      return <AlertTriangle className="text-yellow-500" />;
    case "loading":
      return <Loader2 className="animate-spin" />;
    default:
      return <AlertTriangle className="text-gray-400" />;
  }
};

const labelFromStatus = (status: Status) => {
  switch (status) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    case "degraded":
      return "Degraded";
    case "loading":
      return "Checking...";
    default:
      return "Unknown";
  }
};

const SystemStatus = () => {
  const [status, setStatus] = useState<{ server: Status; db: Status }>({ server: "loading", db: "loading" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchStatus()
      .then(res => { if (mounted) setStatus(res); })
      .catch((e) => {
        if (mounted) {
          setError("Could not fetch status");
          setStatus({ server: "unknown", db: "unknown" });
        }
      });
    return () => { mounted = false }
  }, []);

  return (
    <Card className="mb-6 w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <div className="text-destructive">{error}</div>}
        <div className="flex items-center gap-3">
          <Server className="h-5 w-5" />
          <span>Server</span>
          {iconFromStatus(status.server)}
          <span className="ml-1">{labelFromStatus(status.server)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5" />
          <span>Database</span>
          {iconFromStatus(status.db)}
          <span className="ml-1">{labelFromStatus(status.db)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default SystemStatus;
