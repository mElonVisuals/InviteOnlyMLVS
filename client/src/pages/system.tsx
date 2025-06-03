import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ServerIcon,
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  NetworkIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ActivityIcon,
  DatabaseIcon,
  WifiIcon
} from "lucide-react";

interface SessionData {
  accessTime: string;
  inviteCode: string;
}

export default function SystemPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  if (!sessionData) {
    return null;
  }

  const systemStatus = {
    cpu: { usage: 45, temperature: 62, cores: 8 },
    memory: { used: 12.4, total: 32, usage: 38.75 },
    storage: { used: 256, total: 1024, usage: 25 },
    network: { upload: 1.2, download: 5.8, latency: 12 },
    uptime: "15d 8h 32m",
    load: [1.2, 1.8, 2.1]
  };

  const services = [
    { name: "Web Server", status: "running", port: 5000, uptime: "15d 8h" },
    { name: "Database", status: "running", port: 5432, uptime: "15d 8h" },
    { name: "Cache Server", status: "running", port: 6379, uptime: "15d 7h" },
    { name: "Auth Service", status: "running", port: 3001, uptime: "15d 8h" },
    { name: "File Storage", status: "warning", port: 9000, uptime: "2d 4h" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />;
      default: return <AlertTriangleIcon className="w-4 h-4 text-red-400" />;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/3 to-slate-900"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/8 rounded-full blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-purple-500/6 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20" variant="outline">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">System Monitor</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <p className="text-white/60 text-sm">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            <Button 
              onClick={() => setLastUpdate(new Date())}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <CpuIcon className="text-blue-400 w-6 h-6" />
                </div>
                <span className="text-white/60 text-sm">{systemStatus.cpu.temperature}°C</span>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">CPU Usage</p>
                <p className="text-2xl font-bold text-white">{systemStatus.cpu.usage}%</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(systemStatus.cpu.usage)}`}
                    style={{ width: `${systemStatus.cpu.usage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <MemoryStickIcon className="text-green-400 w-6 h-6" />
                </div>
                <span className="text-white/60 text-sm">{systemStatus.memory.used}GB / {systemStatus.memory.total}GB</span>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Memory Usage</p>
                <p className="text-2xl font-bold text-white">{systemStatus.memory.usage.toFixed(1)}%</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(systemStatus.memory.usage)}`}
                    style={{ width: `${systemStatus.memory.usage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <HardDriveIcon className="text-purple-400 w-6 h-6" />
                </div>
                <span className="text-white/60 text-sm">{systemStatus.storage.used}GB / {systemStatus.storage.total}GB</span>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Storage Usage</p>
                <p className="text-2xl font-bold text-white">{systemStatus.storage.usage}%</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(systemStatus.storage.usage)}`}
                    style={{ width: `${systemStatus.storage.usage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <NetworkIcon className="text-orange-400 w-6 h-6" />
                </div>
                <span className="text-white/60 text-sm">{systemStatus.network.latency}ms</span>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Network</p>
                <p className="text-lg font-bold text-white">↑{systemStatus.network.upload} MB/s</p>
                <p className="text-lg font-bold text-white">↓{systemStatus.network.download} MB/s</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ServerIcon className="w-5 h-5 mr-2 text-blue-400" />
                Services Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        <p className="text-white/60 text-sm">Port {service.port}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-sm">Uptime</p>
                      <p className="text-white text-sm font-medium">{service.uptime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ActivityIcon className="w-5 h-5 mr-2 text-green-400" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">System Uptime</span>
                  <span className="text-white font-medium">{systemStatus.uptime}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Load Average</span>
                  <span className="text-white font-medium">{systemStatus.load.join(', ')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">CPU Cores</span>
                  <span className="text-white font-medium">{systemStatus.cpu.cores}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Operating System</span>
                  <span className="text-white font-medium">Ubuntu 22.04 LTS</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Node.js Version</span>
                  <span className="text-white font-medium">v20.11.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 h-20 flex-col">
                <DatabaseIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Backup DB</span>
              </Button>
              <Button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 h-20 flex-col">
                <RefreshCwIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Restart Services</span>
              </Button>
              <Button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 h-20 flex-col">
                <WifiIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Network Test</span>
              </Button>
              <Button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 h-20 flex-col">
                <ActivityIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">View Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}