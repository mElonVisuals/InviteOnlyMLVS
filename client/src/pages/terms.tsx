import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import mlvsLogo from "@assets/mlvs_district (2).png";

export default function TermsPage() {
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
                  <div className="p-4 bg-purple-500/20 rounded-2xl backdrop-blur-sm border border-purple-400/30">
                    <FileTextIcon className="text-purple-400 w-8 h-8" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                <p className="text-white/70 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
                <div className="mt-4 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <p className="text-blue-100 font-medium">Simple terms for a hobby project - use responsibly and have fun!</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. About This Hobby Project</h2>
                  <div className="text-white/80 space-y-4">
                    <p>This is a personal hobby project created for educational and demonstration purposes. By accessing this website, you acknowledge that:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>This is not a commercial service or business</li>
                      <li>No warranties or guarantees are provided</li>
                      <li>The site may be modified or discontinued at any time</li>
                      <li>Use is entirely at your own discretion</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. Invite-Only Access</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Access requires a valid invite code:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Invite codes are for personal use only</li>
                      <li>Please don't share codes publicly</li>
                      <li>Codes may expire or be limited in number</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. Basic Usage Guidelines</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Please use the site responsibly:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Don't attempt to break or exploit the website</li>
                      <li>Don't use automated tools to spam requests</li>
                      <li>Respect the educational nature of this project</li>
                      <li>Be considerate of others who may visit</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. No Data Collection</h2>
                  <div className="text-white/80 space-y-4">
                    <p>As stated in our Privacy Policy:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>We don't collect personal information</li>
                      <li>No user accounts or profiles are created</li>
                      <li>Only basic invite code validation is processed</li>
                      <li>Your privacy is fully respected</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Educational Purpose</h2>
                  <div className="text-white/80 space-y-4">
                    <p>This project demonstrates:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Modern web development techniques</li>
                      <li>Invite-only access systems</li>
                      <li>Responsive design principles</li>
                      <li>Privacy-focused development</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. No Warranties</h2>
                  <div className="text-white/80 space-y-4">
                    <p>As a hobby project:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>The site is provided "as is"</li>
                      <li>No guarantees of availability or functionality</li>
                      <li>May contain bugs or experimental features</li>
                      <li>No support or maintenance promises</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
                  <div className="text-white/80 space-y-4">
                    <p>The code and design are part of a learning project:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Created for educational purposes</li>
                      <li>May reference open-source components</li>
                      <li>Not intended for commercial reproduction</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Since this is a non-commercial hobby project, there is no liability for:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Site downtime or technical issues</li>
                      <li>Any inconvenience caused by bugs</li>
                      <li>Changes or discontinuation of the project</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Changes</h2>
                  <div className="text-white/80 space-y-4">
                    <p>These terms may be updated as the hobby project evolves. Any changes will be posted here. Continued use means you accept any updates.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">10. Questions</h2>
                  <div className="text-white/80">
                    <p>If you have questions about this hobby project or these terms, feel free to reach out through available contact methods.</p>
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
              <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
              <span>© 2024 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}