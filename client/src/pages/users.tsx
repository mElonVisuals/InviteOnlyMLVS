import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UsersIcon,
  UserPlusIcon,
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  ArrowLeftIcon,
  ShieldIcon,
  CrownIcon,
  UserIcon,
  BanIcon
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

interface User {
  sessionId: number;
  discordUsername: string | null;
  inviteCode: string;
  accessTime: string;
  status: string;
}

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        fetchUsers();
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        const userList = data.sessions.map((session: any) => ({
          sessionId: session.sessionId,
          discordUsername: session.discordUsername || 'Guest User',
          inviteCode: session.inviteCode,
          accessTime: session.accessTime,
          status: new Date().getTime() - new Date(session.accessTime).getTime() < 24 * 60 * 60 * 1000 ? 'Active' : 'Inactive'
        }));
        setUsers(userList);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  if (!sessionData) {
    return null;
  }

  const getRoleIcon = (username: string | null) => {
    if (username === null || username === 'Guest User') {
      return <UserIcon className="w-4 h-4 text-gray-400" />;
    }
    return <UserIcon className="w-4 h-4 text-blue-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/20';
      case 'Inactive': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.discordUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.inviteCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || 
                         (filterRole === "guest" && (!user.discordUsername || user.discordUsername === 'Guest User')) ||
                         (filterRole === "discord" && user.discordUsername && user.discordUsername !== 'Guest User');
    return matchesSearch && matchesFilter;
  });

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
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <p className="text-white/60">Manage and monitor user access</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

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
                <UserIcon className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'Active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ShieldIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white/60 text-sm">Discord Users</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => u.discordUsername && u.discordUsername !== 'Guest User').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BanIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-white/60 text-sm">Guest Users</p>
                  <p className="text-2xl font-bold text-white">{users.filter(u => !u.discordUsername || u.discordUsername === 'Guest User').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Users</option>
                  <option value="discord">Discord Users</option>
                  <option value="guest">Guest Users</option>
                </select>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <FilterIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white/80 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Invite Code</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Access Time</th>
                    <th className="text-left py-3 px-4 text-white/80 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.sessionId} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.discordUsername)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.discordUsername}</p>
                            <p className="text-white/50 text-sm">Session #{user.sessionId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70 font-mono text-sm">{user.inviteCode}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white/70 text-sm">
                          {new Date(user.accessTime).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10">
                          <MoreVerticalIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UsersIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No users found</p>
                  <p className="text-white/40 text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}