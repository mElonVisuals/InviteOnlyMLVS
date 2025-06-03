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
import mlvsLogo from "@assets/mlvs_district.png";

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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="mx-auto w-24 h-24 mb-6 relative">
              <img 
                src={mlvsLogo} 
                alt="MLVS District" 
                className="w-full h-full object-contain filter drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              MLVS District
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <ShieldCheckIcon className="text-blue-400 w-5 h-5" />
              <span className="text-blue-400 font-medium">Secure Access Portal</span>
            </div>
            <p className="text-slate-300 text-lg">Enter your invite code to continue</p>
          </div>

          {/* Invite Form */}
          <Card className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/5"></div>
            <CardContent className="p-8 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Invite Code Input */}
                <div>
                  <Label htmlFor="invite-code" className="block text-sm font-medium text-white/90 mb-3">
                    Invite Code
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      id="invite-code"
                      value={inviteCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-lg font-mono tracking-wider uppercase pr-12 text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="ENTER-CODE-HERE"
                      maxLength={16}
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <TicketIcon className="text-white/60 w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={validateInviteMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02]"
                >
                  <span>
                    {validateInviteMutation.isPending ? 'Verifying Access...' : 'Verify Access'}
                  </span>
                  {validateInviteMutation.isPending ? (
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRightIcon className="w-5 h-5" />
                  )}
                </Button>

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
          <div className="text-center mt-8">
            <p className="text-sm text-white/60">
              Don't have an invite code?{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Request access
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img 
                src={mlvsLogo} 
                alt="MLVS District" 
                className="w-8 h-8 object-contain opacity-80"
              />
              <span className="text-white/80 font-medium">MLVS District</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-white/60">
              <a href="#" className="hover:text-white/80 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/80 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white/80 transition-colors">Support</a>
            </div>
            <div className="text-sm text-white/50">
              © 2024 MLVS District. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
