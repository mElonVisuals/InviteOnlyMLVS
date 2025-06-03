import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  SettingsIcon,
  UserIcon,
  BellIcon,
  ShieldIcon,
  DatabaseIcon,
  PaletteIcon,
  ArrowLeftIcon,
  SaveIcon,
  KeyIcon,
  MonitorIcon,
  GlobeIcon,
  LockIcon,
  MailIcon,
  SmartphoneIcon
} from "lucide-react";

interface SessionData {
  accessTime: string;
  inviteCode: string;
}

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [activeTab, setActiveTab] = useState("general");

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

  const tabs = [
    { id: "general", label: "General", icon: <SettingsIcon className="w-4 h-4" /> },
    { id: "account", label: "Account", icon: <UserIcon className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <BellIcon className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <ShieldIcon className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <PaletteIcon className="w-4 h-4" /> },
    { id: "system", label: "System", icon: <DatabaseIcon className="w-4 h-4" /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Auto-save changes</p>
                    <p className="text-white/60 text-sm">Automatically save configuration changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Enable logging</p>
                    <p className="text-white/60 text-sm">Record system events and user activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Debug mode</p>
                    <p className="text-white/60 text-sm">Show detailed error messages and logs</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Display Name</label>
                  <input 
                    type="text" 
                    defaultValue="Admin User"
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="admin@mlvsdistrict.com"
                    className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm">Role</label>
                  <select className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="admin">Administrator</option>
                    <option value="moderator">Moderator</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MailIcon className="w-5 h-5 mr-2" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">System alerts</p>
                    <p className="text-white/60 text-sm">Receive notifications about system status</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Security alerts</p>
                    <p className="text-white/60 text-sm">Get notified about security events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <SmartphoneIcon className="w-5 h-5 mr-2" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Real-time updates</p>
                    <p className="text-white/60 text-sm">Instant notifications for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <KeyIcon className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-factor authentication</p>
                    <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30" size="sm">
                    Enable 2FA
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Session timeout</p>
                    <p className="text-white/60 text-sm">Automatically log out after inactivity</p>
                  </div>
                  <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LockIcon className="w-5 h-5 mr-2" />
                  Password & Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30">
                  Change Password
                </Button>
                <Button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                  Revoke All Sessions
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Theme Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Color Theme</label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg cursor-pointer">
                      <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded mb-2"></div>
                      <p className="text-blue-400 text-sm text-center">Ocean</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg cursor-pointer">
                      <div className="w-full h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded mb-2"></div>
                      <p className="text-purple-400 text-sm text-center">Cosmic</p>
                    </div>
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg cursor-pointer">
                      <div className="w-full h-8 bg-gradient-to-r from-green-500 to-green-600 rounded mb-2"></div>
                      <p className="text-green-400 text-sm text-center">Forest</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Reduced animations</p>
                    <p className="text-white/60 text-sm">Minimize motion effects for better performance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/60 text-sm">Database Connection</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input 
                      type="text" 
                      defaultValue="postgresql://localhost:5432/mlvs"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <Button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30" size="sm">
                      Test
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm">API Rate Limit</label>
                  <select className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="100">100 requests/minute</option>
                    <option value="500">500 requests/minute</option>
                    <option value="1000">1000 requests/minute</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Maintenance mode</p>
                    <p className="text-white/60 text-sm">Temporarily disable public access</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-red-400">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                  Reset All Settings
                </Button>
                <Button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
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
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>
          
          <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}