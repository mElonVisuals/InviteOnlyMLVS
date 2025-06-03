import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShieldIcon,
  UserIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mlvsLogo from "@assets/mlvs_district (1) (1).png";

export default function DiscordLoginPage() {
  const [, setLocation] = useLocation();
  const [discordUsername, setDiscordUsername] = useState("");
  const [discordUserId, setDiscordUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

    setIsLoading(true);
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
        // Store session data
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

        setLocation('/welcome');
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img 
              src={mlvsLogo} 
              alt="MLVS District Logo" 
              className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-lg"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Discord Login
            </CardTitle>
            <p className="text-white/60">
              Sign in with your Discord credentials if you've previously accessed the system
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleDiscordLogin} className="space-y-4">
            <div>
              <Label htmlFor="discordUsername" className="text-white/80">Discord Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  id="discordUsername"
                  type="text"
                  placeholder="Enter your Discord username"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="discordUserId" className="text-white/80">Discord User ID</Label>
              <div className="relative">
                <ShieldIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  id="discordUserId"
                  type="text"
                  placeholder="Enter your Discord user ID"
                  value={discordUserId}
                  onChange={(e) => setDiscordUserId(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10"
                  required
                />
              </div>
              <p className="text-white/50 text-xs mt-1">
                Right-click your profile in Discord and select "Copy User ID"
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In with Discord
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-white/60">or</span>
              </div>
            </div>

            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Use Invite Code Instead
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm text-center">
              This login method is for returning users who have previously accessed the system via Discord bot invite codes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}