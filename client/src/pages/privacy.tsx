import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ShieldIcon } from "lucide-react";
import mlvsLogo from "@assets/mlvs_district (1) (1).png";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 animate-pulse"></div>
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:40px_40px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={mlvsLogo} 
                alt="MLVS District" 
                className="w-12 h-6 object-contain opacity-90"
              />
              <span className="text-white font-semibold text-lg">MLVS District</span>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20">
            <CardContent className="p-12">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-blue-500/20 rounded-2xl backdrop-blur-sm border border-blue-400/30">
                    <ShieldIcon className="text-blue-400 w-8 h-8" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                <p className="text-white/70 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="mt-4 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                  <p className="text-green-100 font-medium">This is a hobby project - we do not collect any personal information.</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. No Data Collection</h2>
                  <div className="text-white/80 space-y-4">
                    <p>This is a hobby project created for educational and demonstration purposes. We do not collect, store, or process any personal information from users.</p>
                    <p>The only data processed is:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Invite codes for access validation (not linked to personal identity)</li>
                      <li>Temporary session data stored locally in your browser</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. Local Storage</h2>
                  <div className="text-white/80 space-y-4">
                    <p>The website may use browser local storage to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Remember if you've successfully entered an invite code</li>
                      <li>Store user preferences for the current session</li>
                      <li>Enable proper functioning of the website</li>
                    </ul>
                    <p>This information stays on your device and is not transmitted to any servers.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. No Third-Party Services</h2>
                  <div className="text-white/80 space-y-4">
                    <p>This hobby project does not integrate with:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Analytics services (Google Analytics, etc.)</li>
                      <li>Social media tracking pixels</li>
                      <li>Advertising networks</li>
                      <li>External data collection services</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Server Logs</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Standard web server logs may temporarily record:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>IP addresses for basic security</li>
                      <li>Browser type and version</li>
                      <li>Access timestamps</li>
                    </ul>
                    <p>These logs are used solely for technical maintenance and are not analyzed for personal data.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Hobby Project Nature</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Important to understand:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>This is a personal hobby project, not a commercial service</li>
                      <li>No personal data is collected for any purpose</li>
                      <li>No user accounts or profiles are created</li>
                      <li>No marketing or commercial use of any information</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Your Control</h2>
                  <div className="text-white/80 space-y-4">
                    <p>You maintain full control:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Clear your browser's local storage at any time</li>
                      <li>Use incognito/private browsing mode</li>
                      <li>No account deletion needed (no accounts exist)</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to This Policy</h2>
                  <div className="text-white/80">
                    <p>Any changes to this privacy policy will be posted on this page. Given the hobby nature of this project and the lack of data collection, changes are unlikely but will be clearly communicated if they occur.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Questions</h2>
                  <div className="text-white/80">
                    <p>If you have any questions about this privacy policy or the hobby project, you can reach out through the platform's contact methods.</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-white/50">
            <div className="flex items-center space-x-2">
              <img 
                src={mlvsLogo} 
                alt="MLVS District" 
                className="w-5 h-2.5 object-contain opacity-70"
              />
              <span>MLVS District</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
              <span>© 2024 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}