import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileTextIcon,
  DownloadIcon,
  CalendarIcon,
  FilterIcon,
  BarChart3Icon,
  TrendingUpIcon,
  ArrowLeftIcon,
  FileSpreadsheetIcon,
  PieChartIcon,
  ClockIcon,
  UsersIcon,
  ActivityIcon
} from "lucide-react";

interface SessionData {
  accessTime: string;
  inviteCode: string;
}

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("last30days");
  const [reportType, setReportType] = useState("all");

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

  const reports = [
    {
      id: 1,
      name: "User Activity Report",
      type: "activity",
      description: "Detailed analysis of user engagement and session data",
      lastGenerated: "2024-06-03 14:30",
      size: "2.4 MB",
      format: "PDF",
      status: "ready"
    },
    {
      id: 2,
      name: "System Performance Report",
      type: "performance", 
      description: "Server metrics, uptime, and resource utilization",
      lastGenerated: "2024-06-03 12:00",
      size: "1.8 MB",
      format: "PDF",
      status: "ready"
    },
    {
      id: 3,
      name: "Security Audit Report",
      type: "security",
      description: "Security events, login attempts, and access logs",
      lastGenerated: "2024-06-02 09:15",
      size: "3.1 MB", 
      format: "PDF",
      status: "ready"
    },
    {
      id: 4,
      name: "Data Export - Users",
      type: "export",
      description: "Complete user database export with activity metrics",
      lastGenerated: "2024-06-03 16:45",
      size: "856 KB",
      format: "CSV",
      status: "ready"
    },
    {
      id: 5,
      name: "Analytics Summary",
      type: "analytics",
      description: "Traffic, conversion rates, and key performance indicators",
      lastGenerated: "2024-06-03 10:20",
      size: "4.2 MB",
      format: "PDF",
      status: "generating"
    }
  ];

  const quickStats = {
    totalReports: 127,
    generatedToday: 8,
    totalDownloads: 1543,
    avgGenerationTime: "2.3 min"
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'activity': return <UsersIcon className="w-5 h-5 text-blue-400" />;
      case 'performance': return <BarChart3Icon className="w-5 h-5 text-green-400" />;
      case 'security': return <FileTextIcon className="w-5 h-5 text-red-400" />;
      case 'export': return <FileSpreadsheetIcon className="w-5 h-5 text-purple-400" />;
      case 'analytics': return <PieChartIcon className="w-5 h-5 text-orange-400" />;
      default: return <FileTextIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400 bg-green-400/20';
      case 'generating': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredReports = reports.filter(report => {
    if (reportType === 'all') return true;
    return report.type === reportType;
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
            <h1 className="text-3xl font-bold text-white">Reports & Exports</h1>
          </div>
          
          <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
            <FileTextIcon className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
        </div>

        {/* Quick Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileTextIcon className="text-blue-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{quickStats.totalReports}</p>
              <p className="text-white/60 text-sm">Total Reports</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUpIcon className="text-green-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{quickStats.generatedToday}</p>
              <p className="text-white/60 text-sm">Generated Today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DownloadIcon className="text-purple-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{quickStats.totalDownloads}</p>
              <p className="text-white/60 text-sm">Total Downloads</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="text-orange-400 w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-white">{quickStats.avgGenerationTime}</p>
              <p className="text-white/60 text-sm">Avg Generation Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="text-white/60 w-4 h-4" />
                <label className="text-white/60 text-sm">Time Period:</label>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <FilterIcon className="text-white/60 w-4 h-4" />
                <label className="text-white/60 text-sm">Report Type:</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">All Types</option>
                  <option value="activity">Activity Reports</option>
                  <option value="performance">Performance Reports</option>
                  <option value="security">Security Reports</option>
                  <option value="export">Data Exports</option>
                  <option value="analytics">Analytics Reports</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Available Reports ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      {getReportIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{report.name}</h3>
                      <p className="text-white/60 text-sm">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-white/50 text-xs">Generated: {report.lastGenerated}</span>
                        <span className="text-white/50 text-xs">Size: {report.size}</span>
                        <span className="text-white/50 text-xs">Format: {report.format}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status === 'generating' ? (
                        <ActivityIcon className="w-3 h-3 mr-1 animate-spin" />
                      ) : null}
                      {report.status}
                    </div>
                    
                    {report.status === 'ready' && (
                      <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30" size="sm">
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 h-16 flex-col">
                <UsersIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Generate User Report</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 h-16 flex-col">
                <BarChart3Icon className="w-6 h-6 mb-2" />
                <span className="text-sm">System Performance</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <Button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 h-16 flex-col">
                <FileSpreadsheetIcon className="w-6 h-6 mb-2" />
                <span className="text-sm">Export All Data</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}