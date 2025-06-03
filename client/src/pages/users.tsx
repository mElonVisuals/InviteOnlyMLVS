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
  accessTime: string;
  inviteCode: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  lastActive: string;
}

export default function UsersPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

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

  const users: User[] = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@mlvsdistrict.com",
      role: "admin",
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2 minutes ago"
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      status: "active",
      joinDate: "2024-02-20",
      lastActive: "1 hour ago"
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "moderator",
      status: "active",
      joinDate: "2024-03-10",
      lastActive: "3 hours ago"
    },
    {
      id: 4,
      name: "Guest User",
      email: "guest@example.com",
      role: "guest",
      status: "active",
      joinDate: "2024-06-03",
      lastActive: "Just now"
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <CrownIcon className="w-4 h-4 text-yellow-400" />;
      case 'moderator': return <ShieldIcon className="w-4 h-4 text-blue-400" />;
      default: return <UserIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-400 bg-yellow-400/20';
      case 'moderator': return 'text-blue-400 bg-blue-400/20';
      case 'guest': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          
          <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <FilterIcon className="text-white/60 w-4 h-4" />
                <select 
                  value={filterRole} 
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="user">User</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UsersIcon className="text-blue-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-white/60 text-sm">Total Users</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <UserIcon className="text-green-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-white/60 text-sm">Active Users</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CrownIcon className="text-yellow-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-white/60 text-sm">Administrators</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldIcon className="text-purple-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'moderator').length}</p>
              <p className="text-white/60 text-sm">Moderators</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium">{user.name}</p>
                        {getRoleIcon(user.role)}
                      </div>
                      <p className="text-white/60 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </div>
                      <p className="text-white/50 text-xs mt-1">Last active: {user.lastActive}</p>
                    </div>
                    
                    <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20" variant="outline" size="sm">
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}