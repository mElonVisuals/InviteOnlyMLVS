import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  UserIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  FingerprintIcon,
  SparklesIcon,
  StarIcon 
} from "lucide-react";

interface SessionData {
  accessTime: string;
  inviteCode: string;
}

export default function WelcomePage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Get session data from localStorage
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        
        // Format the access time
        const accessTime = new Date(session.accessTime);
        setCurrentTime(accessTime.toLocaleTimeString());
      } catch (error) {
        console.error('Error parsing session data:', error);
        // Redirect back to invite page if no valid session
        setLocation('/');
      }
    } else {
      // Redirect back to invite page if no session data
      setLocation('/');
    }
  }, [setLocation]);

  const handleGetStarted = () => {
    // This would typically navigate to the main app
    // For now, we'll just show a placeholder action
    console.log('Getting started...');
  };

  const handleBackToLogin = () => {
    // Clear session data and return to invite page
    localStorage.removeItem('sessionData');
    setLocation('/');
  };

  if (!sessionData) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-slate-900"></div>
        
        {/* Minimal floating orbs */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-emerald-500/8 rounded-full blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 right-32 w-20 h-20 bg-green-500/6 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl animate-fade-in">
          
          {/* Header Section */}
          <div className="text-center mb-16 relative">
            {/* Success Icon with Enhanced Effects */}
            <div className="mx-auto w-28 h-28 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-slide-up relative overflow-hidden" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse opacity-75"></div>
              <CheckIcon className="text-white w-14 h-14 relative z-10 drop-shadow-lg" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
            </div>

            <h1 className="text-6xl font-bold text-white mb-6 animate-slide-up" style={{animationDelay: '0.4s'}}>Welcome!</h1>
            <p className="text-2xl text-emerald-200 animate-slide-up" style={{animationDelay: '0.6s'}}>Access granted successfully</p>
          </div>

          {/* Main Content Card */}
          <Card className="bg-white/8 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/20 max-w-2xl mx-auto mb-12 animate-slide-up" style={{animationDelay: '0.8s'}}>
            <CardContent className="p-10">
              {/* Session Details */}
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-semibold text-white text-center mb-6">Session Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <UserIcon className="text-emerald-400 w-6 h-6 mx-auto mb-2" />
                    <div className="text-white/60 text-sm">User</div>
                    <div className="text-white font-medium">Guest</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <ClockIcon className="text-blue-400 w-6 h-6 mx-auto mb-2" />
                    <div className="text-white/60 text-sm">Time</div>
                    <div className="text-white font-medium">{currentTime}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <ShieldCheckIcon className="text-emerald-400 w-6 h-6 mx-auto mb-2" />
                    <div className="text-white/60 text-sm">Status</div>
                    <div className="text-emerald-400 font-medium">Active</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <FingerprintIcon className="text-purple-400 w-6 h-6 mx-auto mb-2" />
                    <div className="text-white/60 text-sm">Code</div>
                    <div className="text-white font-mono text-sm">{sessionData.inviteCode}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg shadow-lg hover:shadow-emerald-500/25"
                >
                  <span>Continue</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
                
                <Button 
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Back to Login</span>
                </Button>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm animate-fade-in" style={{animationDelay: '1.6s'}}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-white/70 font-medium text-sm">MLVS District</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-white/50">
              <Link href="/privacy" className="hover:text-white/70 transition-colors duration-300">Privacy</Link>
              <span className="text-white/30">•</span>
              <Link href="/terms" className="hover:text-white/70 transition-colors duration-300">Terms</Link>
              <span className="text-white/30">•</span>
              <span>© 2025 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
