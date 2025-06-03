import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyIcon, TicketIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, Loader2Icon, ShieldCheckIcon, Volume2Icon, VolumeXIcon, PlayIcon, PauseIcon, UserIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import mlvsLogo from "@assets/mlvs_district (1) (1).png";

interface ValidateInviteResponse {
  success: boolean;
  message: string;
  session?: {
    id: number;
    accessTime: string;
    discordUsername: string | null;
  };
}

export default function InvitePage() {
  const [, setLocation] = useLocation();
  const [inviteCode, setInviteCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDiscordLogin, setShowDiscordLogin] = useState(false);
  const [discordUsername, setDiscordUsername] = useState("");
  const [discordUserId, setDiscordUserId] = useState("");
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Background music functionality
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.3;
      audio.loop = true;
    }
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
            sessionId: data.session.id,
            accessTime: data.session.accessTime,
            inviteCode: inviteCode.toUpperCase(),
            discordUsername: data.session.discordUsername,
            discordUserId: null,
            userAgent: null,
            usedAt: null
          }));
        }
        
        setTimeout(() => {
          setLocation('/dashboard');
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

  const handleDiscordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!discordUsername.trim() || !discordUserId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both your Discord username and user ID.",
        variant: "destructive",
      });
      return;
    }

    setIsDiscordLoading(true);
    try {
      const response = await fetch('/api/discord-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordUserId: discordUserId.trim(),
          discordUsername: discordUsername.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        const sessionData = {
          sessionId: data.session.id,
          accessTime: data.session.accessTime,
          inviteCode: 'RETURNING_USER',
          discordUsername: data.session.discordUsername,
          discordUserId: discordUserId.trim(),
          userAgent: navigator.userAgent,
          usedAt: new Date().toISOString()
        };

        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        
        toast({
          title: "Welcome Back!",
          description: "Successfully logged in with Discord.",
        });

        setLocation('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "No previous access found. Please request a new invite code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Discord login error:', error);
      toast({
        title: "Error",
        description: "Failed to authenticate with Discord. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDiscordLoading(false);
    }
  };

  const requestInviteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/request-invite", {});
      return response.json() as Promise<{ success: boolean; invite?: string; message: string; }>;
    },
    onSuccess: (data) => {
      if (data.success && data.invite) {
        // Open Discord invite in new tab
        window.open(data.invite, '_blank');
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Request invite error:', error);
      toast({
        title: "Error",
        description: "Failed to generate Discord invite. Please try again later.",
        variant: "destructive",
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
      {/* Enhanced Animated Background Patterns */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-cyan-500/20 animate-pulse"></div>
        
        {/* Radial gradient effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.15),transparent_50%)] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.12),transparent_50%)] animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Enhanced Floating orbs with more variety */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-indigo-500/15 rounded-full blur-xl animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-cyan-500/12 rounded-full blur-xl animate-bounce" style={{animationDelay: '3s', animationDuration: '6s'}}></div>
        <div className="absolute bottom-1/4 right-20 w-28 h-28 bg-violet-500/12 rounded-full blur-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '5s'}}></div>
        <div className="absolute top-3/4 left-1/4 w-36 h-36 bg-emerald-500/8 rounded-full blur-2xl animate-bounce" style={{animationDelay: '4s', animationDuration: '7s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-pink-500/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '2.5s', animationDuration: '4.5s'}}></div>
        
        {/* Animated waves */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_49%,rgba(59,130,246,0.3)_50%,transparent_51%)] bg-[length:100px_100px] animate-pulse"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]"></div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/5 via-transparent to-blue-500/5"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          


          {/* Header Section */}
          <div className="text-center mb-12 relative">
            {/* Fancy Logo with Modern Effects */}
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
              
              {/* Modern floating orbs */}
              <div className="absolute -top-6 -left-6 w-3 h-3 bg-white rounded-full opacity-60 animate-ping"></div>
              <div className="absolute -top-3 -right-8 w-2 h-2 bg-white rounded-full opacity-50 animate-ping" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute -bottom-4 -left-10 w-2.5 h-2.5 bg-white rounded-full opacity-55 animate-ping" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute -bottom-6 -right-6 w-3 h-3 bg-white rounded-full opacity-45 animate-ping" style={{animationDelay: '1.8s'}}></div>
            </div>
            
            <p className="text-white text-3xl animate-slide-up relative z-10 font-bold" style={{animationDelay: '0.4s'}}>Enter your invite code to continue</p>
          </div>

          {/* Invite Form */}
          <Card className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden animate-slide-up group hover:shadow-blue-500/25 hover:border-blue-400/30 transition-all duration-500" style={{animationDelay: '0.6s'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-white/3 animate-pulse"></div>
            {/* Enhanced border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            {/* Subtle inner glow */}
            <div className="absolute inset-1 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-60"></div>
            <CardContent className="p-10 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-white font-bold text-2xl mb-3 tracking-tight">Access with Invite Code</h2>
                <p className="text-white/70 text-base font-light">Enter your exclusive access code below</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Invite Code Input */}
                <div className="animate-slide-up" style={{animationDelay: '0.8s'}}>
                  <Label htmlFor="invite-code" className="block text-base font-medium text-white/90 mb-4 tracking-wide">
                    Invite Code
                  </Label>
                  <div className="relative group">
                    <Input
                      type="text"
                      id="invite-code"
                      value={inviteCode}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-white/90 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400/50 transition-all duration-300 text-xl font-mono tracking-wider uppercase pr-14 text-black placeholder-gray-500 backdrop-blur-sm hover:bg-white/95 focus:bg-white/95 group-hover:shadow-xl shadow-inner"
                      placeholder="ENTER-CODE-HERE"
                      maxLength={16}
                      required
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                      <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                        <TicketIcon className="text-blue-400 w-5 h-5 transition-colors duration-300 group-hover:text-blue-300" />
                      </div>
                    </div>
                    {/* Enhanced input glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="animate-slide-up" style={{animationDelay: '1s'}}>
                  <Button
                    type="submit"
                    disabled={validateInviteMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center space-x-3 text-xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/30 transform hover:scale-[1.02] relative overflow-hidden group border border-blue-500/30"
                  >
                    {/* Enhanced button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative z-10 tracking-wide">
                      {validateInviteMutation.isPending ? 'Verifying Access...' : 'Verify Access'}
                    </span>
                    {validateInviteMutation.isPending ? (
                      <Loader2Icon className="w-6 h-6 animate-spin relative z-10" />
                    ) : (
                      <ArrowRightIcon className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
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

          {/* Discord Login Toggle */}
          <div className="text-center mt-6 animate-slide-up" style={{animationDelay: '1.2s'}}>
            <Button
              onClick={() => setShowDiscordLogin(!showDiscordLogin)}
              variant="outline"
              className="bg-indigo-600/20 border-indigo-400/30 text-indigo-300 hover:bg-indigo-600/30 px-6 py-3 rounded-xl"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              {showDiscordLogin ? 'Use Invite Code Instead' : 'Returning User? Sign In with Discord'}
            </Button>
          </div>

          {/* Discord Login Form */}
          {showDiscordLogin && (
            <Card className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl animate-slide-up">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Discord Authentication</h3>
                  <p className="text-white/60 text-sm">
                    Sign in with your Discord credentials if you've previously accessed the system
                  </p>
                </div>

                <form onSubmit={handleDiscordLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="discord-username" className="block text-base font-medium text-white/90 mb-2">
                      Discord Username
                    </Label>
                    <Input
                      type="text"
                      id="discord-username"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                      placeholder="Enter your Discord username"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="discord-userid" className="block text-base font-medium text-white/90 mb-2">
                      Discord User ID
                    </Label>
                    <Input
                      type="text"
                      id="discord-userid"
                      value={discordUserId}
                      onChange={(e) => setDiscordUserId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40"
                      placeholder="Enter your Discord user ID"
                      required
                    />
                    <p className="text-white/50 text-xs mt-1">
                      Right-click your profile in Discord and select "Copy User ID"
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isDiscordLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300"
                  >
                    {isDiscordLoading ? (
                      <>
                        <Loader2Icon className="w-5 h-5 animate-spin mr-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-5 h-5 mr-2" />
                        Sign In with Discord
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="text-center mt-8 animate-slide-up" style={{animationDelay: '1.4s'}}>
            <p className="text-sm text-white/60 mb-4">
              Don't have an invite code?
            </p>
            <Button
              onClick={() => requestInviteMutation.mutate()}
              disabled={requestInviteMutation.isPending}
              className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 text-white font-medium py-3 px-8 rounded-xl transition-all duration-500 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 border border-purple-500/30 mx-auto"
            >
              {requestInviteMutation.isPending ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  <span>Generating Discord Invite...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Request Access via Discord</span>
                </>
              )}
            </Button>
          </div>

        </div>
      </div>



      {/* Background Audio - Using Web Audio API for ambient sound */}
      <audio 
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onVolumeChange={(e) => setIsMuted((e.target as HTMLAudioElement).muted)}
      >
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaa7t555NEAxPpuPwtmUdAjiPzfPNeSsFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaq/u55dTFApKnOXrsmEcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaa7t555NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaq/u55dTFApKnOXrsmEcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaq/u55dTFApKnOXrsmEcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaq/u55dTFApKnOXrsmEcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PosmEcBTqY3/DIbSIFLYXR8tOFMQQPaq/u55dTFApKnOXrs=" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>

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
