import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyIcon, TicketIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import mlvsLogo from "@assets/mlvs_district (2).png";

interface ValidateInviteResponse {
  success: boolean;
  message: string;
  session?: {
    id: number;
    accessTime: string;
  };
}

export default function InvitePage() {
  const [, setLocation] = useLocation();
  const [inviteCode, setInviteCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const validateInviteMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/validate-invite", { code });
      return response.json() as Promise<ValidateInviteResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setStatusMessage({
          type: 'success',
          message: data.message
        });
        
        // Store session data and navigate to welcome after delay
        if (data.session) {
          localStorage.setItem('sessionData', JSON.stringify({
            accessTime: data.session.accessTime,
            inviteCode: inviteCode.toUpperCase()
          }));
        }
        
        setTimeout(() => {
          setLocation('/welcome');
        }, 1500);
      } else {
        setStatusMessage({
          type: 'error',
          message: data.message
        });
      }
    },
    onError: (error) => {
      console.error('Validation error:', error);
      setStatusMessage({
        type: 'error',
        message: 'Invalid invite code. Please check and try again.'
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    // Add dashes for formatting
    if (value.length > 4 && value.indexOf('-') === -1) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    }
    if (value.length > 9 && value.lastIndexOf('-') < 5) {
      value = value.slice(0, 9) + '-' + value.slice(9);
    }
    
    setInviteCode(value);
    
    // Clear status message when user starts typing
    if (statusMessage) {
      setStatusMessage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      setStatusMessage({
        type: 'error',
        message: 'Please enter an invite code'
      });
      return;
    }

    validateInviteMutation.mutate(trimmedCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse"></div>
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          
          {/* Logo positioned above everything */}
          <div className="absolute inset-x-0 -top-32 flex items-center justify-center z-0 pointer-events-none">
            <img 
              src={mlvsLogo} 
              alt="MLVS District" 
              className="w-80 opacity-90"
            />
          </div>

          {/* Header Section */}
          <div className="text-center mb-10 relative">
            <div className="flex items-center justify-center space-x-2 mb-4 animate-slide-up relative z-10" style={{animationDelay: '0.2s'}}>
              <ShieldCheckIcon className="text-blue-400 w-6 h-6 animate-pulse" />
              <span className="text-blue-400 font-medium text-lg">Secure Access Portal</span>
            </div>
            <p className="text-slate-300 text-xl animate-slide-up relative z-10" style={{animationDelay: '0.4s'}}>Enter your invite code to continue</p>
          </div>

          {/* Invite Form */}
          <Card className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden animate-slide-up group hover:shadow-blue-500/20 transition-all duration-300" style={{animationDelay: '0.6s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/5 animate-pulse"></div>
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <CardContent className="p-8 relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-white font-semibold text-xl mb-2">Access with Invite Code</h2>
                <p className="text-white/70 text-sm">Enter your exclusive access code below</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Invite Code Input */}
                <div className="animate-slide-up" style={{animationDelay: '0.8s'}}>
                  <Label htmlFor="invite-code" className="block text-sm font-medium text-white/90 mb-3">
                    Invite Code
                  </Label>
                  <div className="relative group">
                    <Input
                      type="text"
                      id="invite-code"
                      value={inviteCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg font-mono tracking-wider uppercase pr-12 text-white placeholder-white/50 backdrop-blur-sm hover:bg-white/15 focus:bg-white/15 group-hover:shadow-lg"
                      placeholder="ENTER-CODE-HERE"
                      maxLength={16}
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <TicketIcon className="text-white/60 w-5 h-5 transition-colors duration-300 group-hover:text-blue-400" />
                    </div>
                    {/* Input glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="animate-slide-up" style={{animationDelay: '1s'}}>
                  <Button
                    type="submit"
                    disabled={validateInviteMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 text-lg shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.02] relative overflow-hidden group"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">
                      {validateInviteMutation.isPending ? 'Verifying Access...' : 'Verify Access'}
                    </span>
                    {validateInviteMutation.isPending ? (
                      <Loader2Icon className="w-5 h-5 animate-spin relative z-10" />
                    ) : (
                      <ArrowRightIcon className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </Button>
                </div>

              </form>

              {/* Status Messages */}
              {statusMessage && (
                <div className={`mt-6 p-4 rounded-xl border backdrop-blur-sm animate-slide-up ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100'
                    : 'bg-red-500/20 border-red-400/30 text-red-100'
                }`}>
                  <div className="flex items-center space-x-2">
                    {statusMessage.type === 'success' ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <XCircleIcon className="w-5 h-5" />
                    )}
                    <span className="font-medium">{statusMessage.message}</span>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="text-center mt-8 animate-slide-up" style={{animationDelay: '1.2s'}}>
            <p className="text-sm text-white/60">
              Don't have an invite code?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-all duration-300 hover:underline">
                Request access
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Compact Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm animate-fade-in" style={{animationDelay: '1.4s'}}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <img 
                src={mlvsLogo} 
                alt="MLVS District" 
                className="w-6 h-3 object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
              />
              <span className="text-white/70 font-medium text-sm">MLVS District</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-white/50">
              <a href="#" className="hover:text-white/70 transition-colors duration-300">Privacy</a>
              <span className="text-white/30">•</span>
              <a href="#" className="hover:text-white/70 transition-colors duration-300">Terms</a>
              <span className="text-white/30">•</span>
              <span>© 2024 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
