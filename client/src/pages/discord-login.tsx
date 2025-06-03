import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon, ArrowLeftIcon } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

export default function DiscordLoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDiscordOAuth = () => {
    setIsLoading(true);
    
    // Redirect to Discord OAuth2 authorization
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/discord/callback`);
    const scope = encodeURIComponent('identify');
    
    if (!clientId) {
      toast({
        title: "Configuration Error",
        description: "Discord OAuth2 is not properly configured.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    
    // Store the current URL to redirect back after authentication
    localStorage.setItem('auth_redirect', '/dashboard');
    
    // Redirect to Discord OAuth2
    window.location.href = discordAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
              <FaDiscord className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Discord Authentication
            </CardTitle>
            <p className="text-white/60">
              Continue with Discord OAuth2 to access the system
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={handleDiscordOAuth}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                  Redirecting to Discord...
                </>
              ) : (
                <>
                  <FaDiscord className="w-5 h-5 mr-3" />
                  Continue with Discord
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

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