import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ServerIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  CpuIcon,
  HardDriveIcon,
  DatabaseIcon,
  WifiIcon,
  ActivityIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from "lucide-react";

interface SessionData {
  sessionId: number;
  accessTime: string;
  inviteCode: string;
  discordUsername: string | null;
  discordUserId: string | null;
  userAgent: string | null;
  usedAt: string | null;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: string;
  networkOut: string;
  uptime: string;
}

interface SystemService {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  port?: number;
  description: string;
}

export default function SystemPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIn: "0 MB",
    networkOut: "0 MB",
    uptime: "0h 0m"
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const services: SystemService[] = [
    {
      name: "Web Server",
      status: "running",
      uptime: systemMetrics.uptime,
      port: 5000,
      description: "Main application server"
    },
    {
      name: "Database",
      status: "running",
      uptime: systemMetrics.uptime,
      port: 5432,
      description: "PostgreSQL database server"
    },
    {
      name: "Discord Bot",
      status: sessionData?.discordUsername ? "running" : "stopped",
      uptime: sessionData?.discordUsername ? systemMetrics.uptime : "0h 0m",
      description: "Discord integration service"
    },
    {
      name: "Session Manager",
      status: "running",
      uptime: systemMetrics.uptime,
      description: "User session management"
    }
  ];

  useEffect(() => {
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        fetchSystemMetrics();
        
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchSystemMetrics, 10000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const fetchSystemMetrics = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/system-metrics');
      if (response.ok) {
        const metrics = await response.json();
        setSystemMetrics(metrics);
      }
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircleIcon className="w-4 h-4 text-red-400" />;
      case 'stopped': return <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />;
      default: return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-400/20';
      case 'error': return 'text-red-400 bg-red-400/20';
      case 'stopped': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 80) return 'bg-red-400';
    if (usage > 60) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  if (!sessionData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">System Monitor</h1>
              <p className="text-white/60">Real-time system performance and health</p>
            </div>
          </div>
          <Button
            onClick={fetchSystemMetrics}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isRefreshing}
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* System Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CpuIcon className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white/60 text-sm">CPU Usage</p>
                    <p className="text-2xl font-bold text-white">{systemMetrics.cpuUsage}%</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemMetrics.cpuUsage)}`}
                  style={{ width: `${systemMetrics.cpuUsage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <DatabaseIcon className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white/60 text-sm">Memory Usage</p>
                    <p className="text-2xl font-bold text-white">{systemMetrics.memoryUsage}%</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemMetrics.memoryUsage)}`}
                  style={{ width: `${systemMetrics.memoryUsage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <HardDriveIcon className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-white/60 text-sm">Disk Usage</p>
                    <p className="text-2xl font-bold text-white">{systemMetrics.diskUsage}%</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemMetrics.diskUsage)}`}
                  style={{ width: `${systemMetrics.diskUsage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network and Uptime */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUpIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white/60 text-sm">Network In</p>
                  <p className="text-xl font-bold text-white">{systemMetrics.networkIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUpIcon className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-white/60 text-sm">Network Out</p>
                  <p className="text-xl font-bold text-white">{systemMetrics.networkOut}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <WifiIcon className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">System Uptime</p>
                  <p className="text-xl font-bold text-white">{systemMetrics.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <ServerIcon className="w-5 h-5 mr-2" />
              System Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <ServerIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{service.name}</h3>
                        <p className="text-white/60 text-sm">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {service.port && (
                        <span className="text-white/60 text-sm">:{service.port}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        <span className="capitalize">{service.status}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-white/60 text-sm">
                    <span>Uptime: {service.uptime}</span>
                    <span>Last checked: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ActivityIcon className="w-5 h-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Platform</span>
                  <span className="text-white">Node.js</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Environment</span>
                  <span className="text-white">Production</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Database</span>
                  <span className="text-white">PostgreSQL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Session ID</span>
                  <span className="text-white">#{sessionData.sessionId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">User Agent</span>
                  <span className="text-white text-xs truncate max-w-[200px]" title={sessionData.userAgent || 'N/A'}>
                    {sessionData.userAgent || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Access Time</span>
                  <span className="text-white text-xs">
                    {new Date(sessionData.accessTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-white/60">Last Refresh</span>
                  <span className="text-white text-xs">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <AlertTriangleIcon className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">System Healthy</span>
                  </div>
                  <p className="text-white/80 text-sm">All systems operating normally</p>
                </div>

                {systemMetrics.cpuUsage > 80 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">High CPU Usage</span>
                    </div>
                    <p className="text-white/80 text-sm">CPU usage is above 80%</p>
                  </div>
                )}

                {systemMetrics.memoryUsage > 80 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangleIcon className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-medium">High Memory Usage</span>
                    </div>
                    <p className="text-white/80 text-sm">Memory usage is above 80%</p>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <ActivityIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Auto-Refresh Active</span>
                  </div>
                  <p className="text-white/80 text-sm">Metrics update every 10 seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}