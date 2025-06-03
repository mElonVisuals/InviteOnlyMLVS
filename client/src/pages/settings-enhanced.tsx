import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  SettingsIcon,
  ArrowLeftIcon,
  UserIcon,
  MailIcon,
  ShieldIcon,
  BellIcon,
  LockIcon,
  SaveIcon,
  CheckIcon,
  LinkIcon,
  ExternalLinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SessionData {
  sessionId: number;
  accessTime: string;
  inviteCode: string;
  discordUsername: string | null;
  discordUserId: string | null;
  userAgent: string | null;
  usedAt: string | null;
}

interface UserProfile {
  email: string;
  discordConnected: boolean;
  notifications: boolean;
  theme: string;
  language: string;
}

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    discordConnected: false,
    notifications: true,
    theme: 'dark',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSession = localStorage.getItem('sessionData');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as SessionData;
        setSessionData(session);
        
        // Set Discord connection status based on session data
        setProfile(prev => ({
          ...prev,
          discordConnected: !!(session.discordUsername && session.discordUsername !== 'Guest User')
        }));
        
        // Load saved profile from localStorage
        const savedProfile = localStorage.getItem(`profile_${session.sessionId}`);
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(prev => ({ ...prev, ...parsedProfile }));
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  const handleSaveProfile = async () => {
    if (!sessionData) return;
    
    if (!profile.email || !profile.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          email: profile.email,
          discordConnected: profile.discordConnected
        }),
      });

      if (response.ok) {
        // Save profile to localStorage for persistence
        localStorage.setItem(`profile_${sessionData.sessionId}`, JSON.stringify(profile));
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
        
        toast({
          title: "Profile Updated",
          description: "Your settings have been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordConnect = () => {
    if (sessionData?.discordUsername && sessionData.discordUsername !== 'Guest User') {
      toast({
        title: "Already Connected",
        description: `Your Discord account (${sessionData.discordUsername}) is already connected.`,
      });
    } else {
      toast({
        title: "Discord Connection",
        description: "To connect Discord, use an invite code generated from our Discord bot.",
      });
    }
  };

  if (!sessionData) {
    return null;
  }

  const currentUser = sessionData.discordUsername || 'Guest User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-white/60">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-white/80">Username</Label>
                    <Input
                      id="username"
                      value={currentUser}
                      disabled
                      className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                    />
                    <p className="text-white/50 text-xs mt-1">Username is managed through Discord</p>
                  </div>
                  <div>
                    <Label htmlFor="session" className="text-white/80">Session ID</Label>
                    <Input
                      id="session"
                      value={`#${sessionData.sessionId}`}
                      disabled
                      className="bg-white/10 border-white/20 text-white disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white/80">Email Address *</Label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder-white/40 pl-10"
                      required
                    />
                  </div>
                  <p className="text-white/50 text-xs mt-1">Required for account management and notifications</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ShieldIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Discord Connection</p>
                      <p className="text-white/60 text-sm">
                        {profile.discordConnected ? `Connected as ${currentUser}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDiscordConnect}
                    variant={profile.discordConnected ? "secondary" : "default"}
                    size="sm"
                    className={profile.discordConnected ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {profile.discordConnected ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-white/60 text-sm">Receive updates and alerts via email</p>
                  </div>
                  <Switch
                    checked={profile.notifications}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme" className="text-white/80">Theme</Label>
                    <select
                      id="theme"
                      value={profile.theme}
                      onChange={(e) => setProfile(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="language" className="text-white/80">Language</Label>
                    <select
                      id="language"
                      value={profile.language}
                      onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading || !profile.email}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <LockIcon className="w-5 h-5 mr-2" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-white/80 text-sm space-y-2">
                  <p>• Your session is secured with session-based authentication</p>
                  <p>• Discord connection provides additional verification</p>
                  <p>• Email is used for account recovery and notifications</p>
                  <p>• All data is encrypted and stored securely</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BellIcon className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/users">
                  <Button variant="outline" className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Manage Users
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button variant="outline" className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20">
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="text-center text-white/60 text-xs space-y-1">
                  <p>Session: #{sessionData.sessionId}</p>
                  <p>Access: {new Date(sessionData.accessTime).toLocaleDateString()}</p>
                  <p>Code: {sessionData.inviteCode}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}