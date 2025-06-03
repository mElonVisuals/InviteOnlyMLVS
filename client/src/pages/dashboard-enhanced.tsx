import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HomeIcon,
  SettingsIcon,
  UserIcon,
  BarChart3Icon,
  FileTextIcon,
  ShieldIcon,
  LogOutIcon,
  RefreshCwIcon,
  SearchIcon,
  MenuIcon,
  XIcon,
  ActivityIcon,
  TrendingUpIcon,
  UsersIcon,
  ServerIcon,
  DatabaseIcon,
  WifiIcon,
  CpuIcon,
  HardDriveIcon
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

interface DashboardStats {
  totalUsers: number;
  activeConnections: number;
  systemUptime: string;
  dataTransfer: string;
  discordUsers: number;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }>;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: string;
  networkOut: string;
  uptime: string;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [allSessions, setAllSessions] = useState<SessionData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeConnections: 0,
    systemUptime: "0h 0m",
    dataTransfer: "0 MB",
    discordUsers: 0,
    recentActivity: []
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIn: "0 MB",
    networkOut: "0 MB",
    uptime: "0h 0m"
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check for OAuth2 session data in URL
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSession = urlParams.get('session');
    
    if (oauthSession) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(oauthSession));
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        setSessionData(sessionData);
        
        // Clean URL
        window.history.replaceState({}, document.title, '/dashboard');
        
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing OAuth session data:', error);
        setLocation('/');
        return;
      }
    }
    
    // Check for stored session data
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        fetchDashboardData();
        
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [sessionsResponse, metricsResponse] = await Promise.all([
        fetch('/api/sessions'),
        fetch('/api/system-metrics')
      ]);

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setAllSessions(sessionsData.sessions);
        
        // Calculate real-time statistics
        const now = new Date().getTime();
        const activeThreshold = 24 * 60 * 60 * 1000; // 24 hours
        const activeSessions = sessionsData.sessions.filter((s: SessionData) => 
          now - new Date(s.accessTime).getTime() < activeThreshold
        );
        
        const discordUsers = sessionsData.sessions.filter((s: SessionData) => 
          s.discordUsername && s.discordUsername !== 'Guest User'
        ).length;

        // Generate recent activity from session data
        const recentActivity = sessionsData.sessions
          .slice(-5)
          .reverse()
          .map((session: SessionData) => ({
            timestamp: new Date(session.accessTime).toLocaleTimeString(),
            action: 'User Access',
            user: session.discordUsername || 'Guest User',
            details: `Used invite code ${session.inviteCode}`
          }));

        setStats({
          totalUsers: sessionsData.sessions.length,
          activeConnections: activeSessions.length,
          systemUptime: calculateUptime(),
          dataTransfer: calculateDataTransfer(sessionsData.sessions.length),
          discordUsers,
          recentActivity
        });
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setSystemMetrics(metricsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const calculateUptime = () => {
    const startTime = new Date('2024-06-01'); // Application start date
    const now = new Date();
    const uptimeMs = now.getTime() - startTime.getTime();
    const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptimeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  };

  const calculateDataTransfer = (userCount: number) => {
    // Estimate data transfer based on user activity
    const avgTransferPerUser = 2.5; // MB
    const totalMB = userCount * avgTransferPerUser;
    if (totalMB > 1024) {
      return `${(totalMB / 1024).toFixed(1)} GB`;
    }
    return `${totalMB.toFixed(0)} MB`;
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionData');
    setLocation('/');
  };

  if (!sessionData) {
    return null;
  }

  const currentUser = sessionData.discordUsername || 'Guest User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-2xl border-r border-white/20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShieldIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">MLVS</h1>
                  <p className="text-white/60 text-sm">District</p>
                </div>
              </div>
              <Button
                onClick={() => setSidebarOpen(false)}
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10 bg-white/20"
                >
                  <HomeIcon className="w-4 h-4 mr-3" />
                  Dashboard
                </Button>
              </Link>
              
              <Link href="/users">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <UsersIcon className="w-4 h-4 mr-3" />
                  Users
                </Button>
              </Link>
              
              <Link href="/analytics">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <BarChart3Icon className="w-4 h-4 mr-3" />
                  Analytics
                </Button>
              </Link>
              
              <Link href="/system">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <ServerIcon className="w-4 h-4 mr-3" />
                  System
                </Button>
              </Link>
              
              <Link href="/reports">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <FileTextIcon className="w-4 h-4 mr-3" />
                  Reports
                </Button>
              </Link>
              
              <Link href="/settings">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Settings
                </Button>
              </Link>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{currentUser}</p>
                    <p className="text-white/60 text-xs">Session #{sessionData.sessionId}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                size="sm"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setSidebarOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-white hover:bg-white/10"
                >
                  <MenuIcon className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-white/60">Welcome back, {currentUser}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50"
                  />
                </div>
                <div className="relative">
                  <Button
                    onClick={fetchDashboardData}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 relative"
                    variant="outline"
                    size="sm"
                    title="Refresh real-time data"
                    disabled={isRefreshing}
                  >
                    <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="w-8 h-8 text-blue-400" />
                      <div>
                        <p className="text-white/60 text-sm">Total Users</p>
                        <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <ActivityIcon className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-white/60 text-sm">Active (24h)</p>
                        <p className="text-2xl font-bold text-white">{stats.activeConnections}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <ShieldIcon className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white/60 text-sm">Discord Users</p>
                        <p className="text-2xl font-bold text-white">{stats.discordUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <TrendingUpIcon className="w-8 h-8 text-yellow-400" />
                      <div>
                        <p className="text-white/60 text-sm">Data Transfer</p>
                        <p className="text-2xl font-bold text-white">{stats.dataTransfer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <ServerIcon className="w-5 h-5 mr-2" />
                      System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CpuIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-white/80">CPU Usage</span>
                      </div>
                      <span className="text-white font-medium">{systemMetrics.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemMetrics.cpuUsage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DatabaseIcon className="w-4 h-4 text-green-400" />
                        <span className="text-white/80">Memory Usage</span>
                      </div>
                      <span className="text-white font-medium">{systemMetrics.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemMetrics.memoryUsage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDriveIcon className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80">Disk Usage</span>
                      </div>
                      <span className="text-white font-medium">{systemMetrics.diskUsage}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemMetrics.diskUsage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <ActivityIcon className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{activity.action}</p>
                              <p className="text-white/60 text-xs">{activity.user} - {activity.details}</p>
                            </div>
                            <span className="text-white/40 text-xs">{activity.timestamp}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/60 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <WifiIcon className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-white/60 text-sm">System Uptime</p>
                        <p className="text-xl font-bold text-white">{stats.systemUptime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
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
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}