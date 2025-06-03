import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  UserIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  FingerprintIcon 
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="w-full max-w-2xl text-center animate-fade-in">
        
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <CheckIcon className="text-white w-10 h-10" />
        </div>

        {/* Welcome Content */}
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Welcome!</h1>
        <p className="text-xl text-slate-600 mb-8">Your invite code has been verified successfully.</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            onClick={handleGetStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={handleBackToLogin}
            variant="outline"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-8 rounded-lg border border-slate-300 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Login</span>
          </Button>
        </div>

        {/* User Info */}
        <Card className="bg-white rounded-xl shadow-lg border border-slate-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Access Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              
              <div className="flex items-center space-x-2">
                <UserIcon className="text-slate-400 w-4 h-4" />
                <span className="text-slate-600">User:</span>
                <span className="font-medium text-slate-800">Guest User</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ClockIcon className="text-slate-400 w-4 h-4" />
                <span className="text-slate-600">Access Time:</span>
                <span className="font-medium text-slate-800">{currentTime}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="text-slate-400 w-4 h-4" />
                <span className="text-slate-600">Permission:</span>
                <span className="font-medium text-emerald-600">Verified</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <FingerprintIcon className="text-slate-400 w-4 h-4" />
                <span className="text-slate-600">Session:</span>
                <span className="font-medium text-slate-800">Active</span>
              </div>
              
            </div>
            
            {/* Invite Code Info */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-slate-600">Invite Code:</span>
                <span className="font-mono font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded">
                  {sessionData.inviteCode}
                </span>
              </div>
            </div>
            
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
