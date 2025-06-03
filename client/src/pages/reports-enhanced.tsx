import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileTextIcon,
  ArrowLeftIcon,
  SearchIcon,
  FilterIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  BugIcon,
  UserIcon,
  MessageSquareIcon,
  LightbulbIcon,
  CheckIcon,
  XIcon,
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

interface Report {
  id: number;
  discordUserId: string;
  discordUsername: string;
  content: string;
  reportType: string;
  createdAt: string;
  status: string;
}

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        fetchReports();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchReports, 30000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'bug': return <BugIcon className="w-4 h-4 text-red-400" />;
      case 'user': return <UserIcon className="w-4 h-4 text-orange-400" />;
      case 'general': return <MessageSquareIcon className="w-4 h-4 text-blue-400" />;
      case 'suggestion': return <LightbulbIcon className="w-4 h-4 text-yellow-400" />;
      default: return <FileTextIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckIcon className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XIcon className="w-4 h-4 text-red-400" />;
      case 'pending': return <ClockIcon className="w-4 h-4 text-yellow-400" />;
      default: return <AlertTriangleIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return 'Bug Report';
      case 'user': return 'User Report';
      case 'general': return 'General Issue';
      case 'suggestion': return 'Suggestion';
      default: return type;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.discordUsername.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.reportType === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
              <h1 className="text-3xl font-bold text-white">Reports</h1>
              <p className="text-white/60">Monitor and manage Discord bot reports</p>
            </div>
          </div>
          <Button
            onClick={fetchReports}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            <RefreshCwIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <FileTextIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white/60 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold text-white">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckIcon className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white/60 text-sm">Resolved</p>
                  <p className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'resolved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BugIcon className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-white/60 text-sm">Bug Reports</p>
                  <p className="text-2xl font-bold text-white">{reports.filter(r => r.reportType === 'bug').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Types</option>
                  <option value="bug">Bug Reports</option>
                  <option value="user">User Reports</option>
                  <option value="general">General Issues</option>
                  <option value="suggestion">Suggestions</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <FilterIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List - Scrollable */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Reports ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div key={report.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {getReportIcon(report.reportType)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">{report.discordUsername}</p>
                            <span className="text-white/40 text-sm">#{report.id}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white/60 text-sm">{getTypeLabel(report.reportType)}</span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/60 text-sm">
                              {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="capitalize">{report.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 mb-3">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {report.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-white/50 text-xs">
                        User ID: {report.discordUserId}
                      </div>
                      <div className="flex space-x-2">
                        {report.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="bg-green-600/20 border-green-400/30 text-green-400 hover:bg-green-600/30">
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Resolve
                            </Button>
                            <Button size="sm" variant="outline" className="bg-red-600/20 border-red-400/30 text-red-400 hover:bg-red-600/30">
                              <XIcon className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileTextIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg mb-2">No reports found</p>
                  <p className="text-white/40 text-sm">
                    {searchTerm || filterType !== "all" || filterStatus !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Reports from Discord bot will appear here"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-6">
          <CardContent className="p-6">
            <div className="text-white/80 text-sm space-y-2">
              <h3 className="text-white font-medium mb-3">How to Generate Reports:</h3>
              <p>• Users can submit reports using the <code className="bg-white/20 px-1 rounded">/report</code> command in Discord</p>
              <p>• Available report types: Bug Report, User Report, General Issue, Suggestion</p>
              <p>• Reports are automatically synced and appear here in real-time</p>
              <p>• Click the refresh button or wait for auto-refresh every 30 seconds</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}