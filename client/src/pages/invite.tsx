import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyIcon, TicketIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, Loader2Icon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <KeyIcon className="text-white text-2xl w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Private Access</h1>
          <p className="text-slate-600 text-lg">Enter your invite code to continue</p>
        </div>

        {/* Invite Form */}
        <Card className="bg-white rounded-2xl shadow-xl border border-slate-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Invite Code Input */}
              <div>
                <Label htmlFor="invite-code" className="block text-sm font-medium text-slate-700 mb-2">
                  Invite Code
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    id="invite-code"
                    value={inviteCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-lg font-mono tracking-wider uppercase pr-12"
                    placeholder="ENTER-CODE-HERE"
                    maxLength={16}
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <TicketIcon className="text-slate-400 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={validateInviteMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-lg"
              >
                <span>
                  {validateInviteMutation.isPending ? 'Verifying...' : 'Verify Access'}
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
              <div className={`mt-4 p-4 rounded-lg border animate-slide-up ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
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

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Don't have an invite code?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Request access
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}
