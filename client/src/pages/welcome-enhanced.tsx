import { useEffect, useState } from "react";
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
  ServerIcon,
  UsersIcon,
  ActivityIcon,
  TrendingUpIcon,
  PlayIcon,
  ArrowRightIcon
} from "lucide-react";
import mlvsLogo from "@assets/mlvs_district (1) (1).png";

interface SessionData {
  sessionId: number;
  accessTime: string;
  inviteCode: string;
  discordUsername: string | null;
  discordUserId: string | null;
  userAgent: string | null;
  usedAt: string | null;
}

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <Link href="/welcome">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10 bg-white/20"
                >
                  <HomeIcon className="w-4 h-4 mr-3" />
                  Welcome
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                  <BarChart3Icon className="w-4 h-4 mr-3" />
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
                  <ActivityIcon className="w-4 h-4 mr-3" />
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
                  <h1 className="text-2xl font-bold text-white">Welcome to MLVS District</h1>
                  <p className="text-white/60">Your secure access portal</p>
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
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 relative"
                    variant="outline"
                    size="sm"
                    title="Refresh data"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Welcome Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Hero Section */}
              <div className="text-center py-12">
                <div className="mb-8">
                  <img 
                    src={mlvsLogo} 
                    alt="MLVS District Logo" 
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-2xl"
                  />
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Welcome to MLVS District
                  </h1>
                  <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                    You've successfully accessed the secure portal. Explore your dashboard and manage your account.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3 text-lg">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Account Settings
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/dashboard">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <BarChart3Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Dashboard</h3>
                          <p className="text-white/60 text-sm">View system overview</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Real-time metrics</span>
                        <ArrowRightIcon className="w-4 h-4 text-white/60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">User Management</h3>
                          <p className="text-white/60 text-sm">Manage Discord users</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Access control</span>
                        <ArrowRightIcon className="w-4 h-4 text-white/60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/system">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <ServerIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">System Monitor</h3>
                          <p className="text-white/60 text-sm">Server performance</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Health status</span>
                        <ArrowRightIcon className="w-4 h-4 text-white/60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/analytics">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <TrendingUpIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Analytics</h3>
                          <p className="text-white/60 text-sm">Usage statistics</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Data insights</span>
                        <ArrowRightIcon className="w-4 h-4 text-white/60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/reports">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                          <FileTextIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Reports</h3>
                          <p className="text-white/60 text-sm">Discord bot reports</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">User feedback</span>
                        <ArrowRightIcon className="w-4 h-4 text-white/60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/settings">
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                          <SettingsIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Settings</h3>
                          <p className="text-white/60 text-sm">Account preferences</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Personalization</span>
                        <ArrowRightIcon className="w-4 h-4 text-white/60" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Session Information */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Session Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">User</p>
                      <p className="text-white font-medium">{currentUser}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Session ID</p>
                      <p className="text-white font-medium">#{sessionData.sessionId}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Invite Code</p>
                      <p className="text-white font-medium font-mono">{sessionData.inviteCode}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Access Time</p>
                      <p className="text-white font-medium">{new Date(sessionData.accessTime).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}