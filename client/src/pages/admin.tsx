import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldIcon,
  ArrowLeftIcon,
  UsersIcon,
  SettingsIcon,
  DatabaseIcon,
  ActivityIcon,
  CrownIcon,
  UserIcon,
  BanIcon,
  CheckIcon,
  XIcon,
  AlertTriangleIcon,
  RefreshCwIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SessionData {
  sessionId: number;
  accessTime: string;
  inviteCode: string;
  discordUsername: string | null;
  discordUserId: string | null;
  userAgent: string | null;
  usedAt: string | null;
}

interface AdminUser {
  sessionId: number;
  accessTime: string;
  inviteCode: string;
  discordUsername: string | null;
  discordUserId: string | null;
  userAgent: string | null;
  usedAt: string | null;
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        checkAdminAccess(session);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const checkAdminAccess = async (session: SessionData) => {
    try {
      const response = await fetch(`/api/admin/check?discordUserId=${session.discordUserId}`);
      const data = await response.json();
      
      if (data.success && data.isAdmin) {
        setIsAdmin(true);
        fetchAdminUsers(session);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to access this panel.",
          variant: "destructive",
        });
        setLocation('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setLocation('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminUsers = async (session: SessionData) => {
    try {
      const response = await fetch(`/api/admin/users?discordUserId=${session.discordUserId}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const refreshData = () => {
    if (sessionData) {
      fetchAdminUsers(sessionData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!sessionData || !isAdmin) {
    return null;
  }

  const getStatusColor = (username: string | null) => {
    if (username && username !== 'Guest User') {
      return 'text-green-400 bg-green-400/20';
    }
    return 'text-gray-400 bg-gray-400/20';
  };

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
              <h1 className="text-3xl font-bold text-white flex items-center">
                <CrownIcon className="w-8 h-8 mr-3 text-yellow-400" />
                Admin Panel
              </h1>
              <p className="text-white/60">System administration and user management</p>
            </div>
          </div>
          <Button
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Admin Status */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <CrownIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Admin Access Granted</h3>
                <p className="text-white/60">You have full administrative privileges</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-400/20 text-yellow-400">
                  ADMIN
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <UsersIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white/60 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ShieldIcon className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">Discord Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.discordUsername && u.discordUsername !== 'Guest User').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ActivityIcon className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Active Sessions</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => new Date().getTime() - new Date(u.accessTime).getTime() < 24 * 60 * 60 * 1000).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DatabaseIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white/60 text-sm">Guest Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => !u.discordUsername || u.discordUsername === 'Guest User').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/80 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Discord ID</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Invite Code</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Access Time</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.sessionId} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.discordUsername || 'Guest User'}</p>
                            <p className="text-white/50 text-sm">Session #{user.sessionId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70 font-mono text-sm">
                          {user.discordUserId || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70 font-mono text-sm">{user.inviteCode}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70 text-sm">
                          {new Date(user.accessTime).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.discordUsername)}`}>
                          {user.discordUsername && user.discordUsername !== 'Guest User' ? 'Discord' : 'Guest'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="bg-blue-600/20 border-blue-400/30 text-blue-400 hover:bg-blue-600/30">
                            <SettingsIcon className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-red-600/20 border-red-400/30 text-red-400 hover:bg-red-600/30">
                            <BanIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">No users found</p>
                  <p className="text-white/40 text-sm">Users with Member role will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                <UsersIcon className="w-4 h-4 mr-2" />
                Manage All Users
              </Button>
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white">
                <DatabaseIcon className="w-4 h-4 mr-2" />
                Database Management
              </Button>
              <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white">
                <ActivityIcon className="w-4 h-4 mr-2" />
                System Monitoring
              </Button>
              <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white">
                <AlertTriangleIcon className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Admin Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <CrownIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Admin Privileges</span>
                </div>
                <p className="text-white/80 text-sm">You have full access to all administrative functions</p>
              </div>
              
              <div className="space-y-2 text-white/80 text-sm">
                <p>• Manage user access and permissions</p>
                <p>• Monitor system performance and health</p>
                <p>• View detailed analytics and reports</p>
                <p>• Configure system settings and security</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}