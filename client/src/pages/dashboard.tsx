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

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [allSessions, setAllSessions] = useState<SessionData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeConnections: 0,
    systemUptime: "99.9%",
    dataTransfer: "2.4TB"
  });

  useEffect(() => {
    // Check for valid session
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        
        // Fetch all sessions with Discord usernames
        fetchSessionData();
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const fetchSessionData = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setAllSessions(data.sessions);
        
        // Update stats based on real data
        setStats(prev => ({
          ...prev,
          totalUsers: data.sessions.length,
          activeConnections: data.sessions.filter((s: SessionData) => 
            new Date().getTime() - new Date(s.accessTime).getTime() < 24 * 60 * 60 * 1000
          ).length
        }));
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (notificationsOpen && !target.closest('.notifications-dropdown') && !target.closest('[data-notification-trigger]')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const handleLogout = () => {
    localStorage.removeItem('sessionData');
    setLocation('/');
  };

  const handleNotificationToggle = () => {
    if (!notificationsOpen && notificationButtonRef.current) {
      const rect = notificationButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setNotificationsOpen(!notificationsOpen);
  };

  if (!sessionData) {
    return null;
  }

  const menuItems = [
    { icon: HomeIcon, label: "Dashboard", path: "/dashboard", active: true },
    { icon: BarChart3Icon, label: "Analytics", path: "/analytics" },
    { icon: UsersIcon, label: "Users", path: "/users" },
    { icon: ServerIcon, label: "System", path: "/system" },
    { icon: FileTextIcon, label: "Reports", path: "/reports" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  const notifications = [
    {
      id: 1,
      title: "System Update Available",
      message: "New security patches are ready to install",
      time: "2 minutes ago",
      type: "info",
      unread: true
    },
    {
      id: 2,
      title: "High CPU Usage Alert",
      message: "Server load is above 85% for the last 10 minutes",
      time: "15 minutes ago", 
      type: "warning",
      unread: true
    },
    {
      id: 3,
      title: "New User Registration",
      message: "3 new users have joined the platform",
      time: "1 hour ago",
      type: "success",
      unread: true
    },
    {
      id: 4,
      title: "Backup Completed",
      message: "Daily database backup finished successfully",
      time: "3 hours ago",
      type: "success",
      unread: false
    },
    {
      id: 5,
      title: "Security Scan Complete",
      message: "Weekly security audit found no vulnerabilities",
      time: "1 day ago",
      type: "info",
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/3 to-slate-900"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/8 rounded-full blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-purple-500/6 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-30 w-64 h-full bg-white/10 backdrop-blur-2xl border-r border-white/20 transition-transform duration-300`}>
          <div className="p-6">
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-2xl font-alfa-slab text-white">MLVS DISTRICT</h1>
              <p className="text-white/60 text-sm mt-1">Control Panel</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    item.active 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {sessionData.discordUsername || 'Guest User'}
                  </p>
                  <p className="text-white/50 text-xs">Code: {sessionData.inviteCode}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm"
                variant="outline"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  variant="outline"
                  size="sm"
                >
                  {sidebarOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
                </Button>
                <h2 className="text-2xl font-bold text-white">Dashboard</h2>
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
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                  </Button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl z-[100]">
                      <div className="p-4 border-b border-white/20">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">Notifications</h3>
                          <Button
                            onClick={() => setNotificationsOpen(false)}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                            variant="outline"
                            size="sm"
                          >
                            <XIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors ${
                              notification.unread ? 'bg-blue-500/5' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className={`text-sm font-medium ${notification.unread ? 'text-white' : 'text-white/70'}`}>
                                    {notification.title}
                                  </h4>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-white/60 text-xs mt-1">{notification.message}</p>
                                <p className="text-white/40 text-xs mt-2">{notification.time}</p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ml-3 mt-1 ${
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                              }`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-4 border-t border-white/20">
                        <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-sm">
                          View All Notifications
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <UsersIcon className="text-blue-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    +12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Connections</p>
                      <p className="text-2xl font-bold text-white">{stats.activeConnections}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <WifiIcon className="text-green-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <ActivityIcon className="w-4 h-4 mr-1" />
                    Real-time
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">System Uptime</p>
                      <p className="text-2xl font-bold text-white">{stats.systemUptime}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <ServerIcon className="text-purple-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <TrendingUpIcon className="w-4 h-4 mr-1" />
                    Excellent
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Data Transfer</p>
                      <p className="text-2xl font-bold text-white">{stats.dataTransfer}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <DatabaseIcon className="text-orange-400 w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <HardDriveIcon className="w-4 h-4 mr-1" />
                    This month
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Status */}
              <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CpuIcon className="w-5 h-5 mr-2 text-blue-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">CPU Usage</span>
                      <span className="text-white font-medium">23%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '23%'}}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Memory Usage</span>
                      <span className="text-white font-medium">67%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '67%'}}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Storage</span>
                      <span className="text-white font-medium">45%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ActivityIcon className="w-5 h-5 mr-2 text-green-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">New user registered</p>
                        <p className="text-white/50 text-xs">2 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">System backup completed</p>
                        <p className="text-white/50 text-xs">15 minutes ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Security scan initiated</p>
                        <p className="text-white/50 text-xs">1 hour ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Database optimization</p>
                        <p className="text-white/50 text-xs">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-20 flex flex-col space-y-2">
                  <UserIcon className="w-6 h-6" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-20 flex flex-col space-y-2">
                  <BarChart3Icon className="w-6 h-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
                
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-20 flex flex-col space-y-2">
                  <SettingsIcon className="w-6 h-6" />
                  <span className="text-sm">System Config</span>
                </Button>
                
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-20 flex flex-col space-y-2">
                  <ShieldIcon className="w-6 h-6" />
                  <span className="text-sm">Security</span>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}