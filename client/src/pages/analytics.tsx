import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  ActivityIcon,
  PieChartIcon,
  LineChartIcon,
  ArrowLeftIcon,
  CalendarIcon,
  DownloadIcon
} from "lucide-react";

interface SessionData {
  accessTime: string;
  inviteCode: string;
}

export default function AnalyticsPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [timeRange, setTimeRange] = useState("7d");

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

  const analyticsData = {
    totalViews: 45672,
    uniqueVisitors: 12843,
    bounceRate: 34.2,
    avgSessionDuration: "4m 32s",
    conversionRate: 2.8,
    revenue: "$12,450"
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
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Views</p>
                  <p className="text-3xl font-bold text-white">{analyticsData.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <BarChart3Icon className="text-blue-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-green-400 text-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +23% from last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Unique Visitors</p>
                  <p className="text-3xl font-bold text-white">{analyticsData.uniqueVisitors.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <UsersIcon className="text-green-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-green-400 text-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +18% from last period
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Bounce Rate</p>
                  <p className="text-3xl font-bold text-white">{analyticsData.bounceRate}%</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDownIcon className="text-red-400 w-6 h-6" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-red-400 text-sm">
                <TrendingDownIcon className="w-4 h-4 mr-1" />
                -5% from last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <LineChartIcon className="w-5 h-5 mr-2 text-blue-400" />
                Traffic Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg bg-white/5">
                <div className="text-center">
                  <ActivityIcon className="w-12 h-12 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60">Interactive chart would be displayed here</p>
                  <p className="text-white/40 text-sm">Showing {timeRange} data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-purple-400" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-white/70">Direct</span>
                  </div>
                  <span className="text-white font-medium">42%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-white/70">Organic Search</span>
                  </div>
                  <span className="text-white font-medium">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-white/70">Social Media</span>
                  </div>
                  <span className="text-white font-medium">18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-white/70">Referral</span>
                  </div>
                  <span className="text-white font-medium">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Avg. Session Duration</p>
              <p className="text-2xl font-bold text-white">{analyticsData.avgSessionDuration}</p>
              <div className="mt-2 flex items-center justify-center text-green-400 text-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +12% improvement
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{analyticsData.conversionRate}%</p>
              <div className="mt-2 flex items-center justify-center text-green-400 text-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +0.3% increase
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-2xl border border-white/20">
            <CardContent className="p-6 text-center">
              <p className="text-white/60 text-sm mb-2">Total Revenue</p>
              <p className="text-2xl font-bold text-white">{analyticsData.revenue}</p>
              <div className="mt-2 flex items-center justify-center text-green-400 text-sm">
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                +28% growth
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}