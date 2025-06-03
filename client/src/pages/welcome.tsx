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
      {/* Enhanced Animated Background Patterns */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-cyan-500/20 animate-pulse"></div>
        
        {/* Radial gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.15),transparent_50%)] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(34,197,94,0.12),transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Enhanced Floating orbs with success theme */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-green-500/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-cyan-500/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-teal-500/12 rounded-full blur-xl animate-bounce" style={{animationDelay: '3s', animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/4 right-20 w-28 h-28 bg-emerald-400/12 rounded-full blur-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '5s'}}></div>
        <div className="absolute top-3/4 left-1/4 w-36 h-36 bg-green-500/8 rounded-full blur-2xl animate-bounce" style={{animationDelay: '4s', animationDuration: '7s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/5 via-transparent to-emerald-500/5"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl animate-fade-in">
          
          {/* Header Section */}
          <div className="text-center mb-12 relative">
            {/* Success Logo with Modern Effects */}
            <div className="relative mb-8 animate-slide-up animate-float" style={{animationDelay: '0.2s'}}>
              {/* Background glow effect */}
              <div className="absolute inset-0 blur-2xl opacity-40">
                <h1 className="text-6xl font-alfa-slab text-white">
                  MLVS DISTRICT
                </h1>
              </div>
              
              {/* Main logo with white color and glow */}
              <h1 className="relative text-6xl font-alfa-slab text-white animate-glow drop-shadow-2xl" style={{textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.1)'}}>
                MLVS DISTRICT
              </h1>
              
              {/* Success particles */}
              <div className="absolute -top-6 -left-6 w-3 h-3 bg-emerald-400 rounded-full opacity-80 animate-ping"></div>
              <div className="absolute -top-3 -right-8 w-2 h-2 bg-green-400 rounded-full opacity-70 animate-ping" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute -bottom-4 -left-10 w-2.5 h-2.5 bg-cyan-400 rounded-full opacity-75 animate-ping" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute -bottom-6 -right-6 w-3 h-3 bg-teal-400 rounded-full opacity-65 animate-ping" style={{animationDelay: '1.8s'}}></div>
            </div>

            {/* Success Icon with Enhanced Effects */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-slide-up relative overflow-hidden" style={{animationDelay: '0.4s'}}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse opacity-75"></div>
              <CheckIcon className="text-white w-12 h-12 relative z-10 drop-shadow-lg" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
            </div>

            <h2 className="text-5xl font-bold text-white mb-4 animate-slide-up" style={{animationDelay: '0.6s'}}>Welcome!</h2>
            <p className="text-2xl text-emerald-200 mb-8 animate-slide-up" style={{animationDelay: '0.8s'}}>Access granted successfully</p>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Get Started Card */}
            <Card className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden animate-slide-up group hover:shadow-emerald-500/25 hover:border-emerald-400/30 transition-all duration-500" style={{animationDelay: '1s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 animate-pulse"></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <CardContent className="p-8 relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Get Started</h3>
                <p className="text-white/70 mb-6">Begin your journey with full access</p>
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-green-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center space-x-3 text-lg shadow-2xl hover:shadow-emerald-500/30 transform hover:scale-[1.02] relative overflow-hidden group border border-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Continue</span>
                  <ArrowRightIcon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Session Details Card */}
            <Card className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden animate-slide-up" style={{animationDelay: '1.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-white/3 animate-pulse"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Session Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="text-emerald-400 w-5 h-5" />
                      <span className="text-white/70">User</span>
                    </div>
                    <span className="font-semibold text-white">Guest User</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="text-blue-400 w-5 h-5" />
                      <span className="text-white/70">Access Time</span>
                    </div>
                    <span className="font-semibold text-white">{currentTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <FingerprintIcon className="text-purple-400 w-5 h-5" />
                      <span className="text-white/70">Status</span>
                    </div>
                    <span className="font-semibold text-emerald-400">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <StarIcon className="text-yellow-400 w-5 h-5" />
                      <span className="text-white/70">Code</span>
                    </div>
                    <span className="font-mono font-semibold text-white bg-white/10 px-3 py-1 rounded-lg">
                      {sessionData.inviteCode}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <div className="text-center animate-slide-up" style={{animationDelay: '1.4s'}}>
            <Button 
              onClick={handleBackToLogin}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Login</span>
            </Button>
          </div>
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
