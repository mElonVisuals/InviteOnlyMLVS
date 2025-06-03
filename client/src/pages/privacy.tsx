import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ShieldIcon } from "lucide-react";
import mlvsLogo from "@assets/mlvs_district (2).png";

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
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We collect information you provide directly to us when using our invite-only platform:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Invite codes used to access the platform</li>
                      <li>Access timestamps and session data</li>
                      <li>Browser information and user agent data</li>
                      <li>IP address for security and analytics purposes</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We use the collected information for:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Providing secure access to our platform</li>
                      <li>Maintaining invite code validation and security</li>
                      <li>Analyzing platform usage and performance</li>
                      <li>Preventing unauthorized access and abuse</li>
                      <li>Improving our services and user experience</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>When required by law or legal process</li>
                      <li>To protect our rights, property, or safety</li>
                      <li>With trusted service providers who assist in operating our platform</li>
                      <li>In connection with a business transfer or acquisition</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We implement appropriate security measures to protect your information:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Encrypted data transmission and storage</li>
                      <li>Regular security audits and monitoring</li>
                      <li>Access controls and authentication measures</li>
                      <li>Secure database configurations and backups</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We retain your information for as long as necessary to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide our services effectively</li>
                      <li>Comply with legal obligations</li>
                      <li>Resolve disputes and enforce agreements</li>
                      <li>Maintain security and prevent abuse</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
                  <div className="text-white/80 space-y-4">
                    <p>You have the right to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Request access to your personal information</li>
                      <li>Request correction of inaccurate data</li>
                      <li>Request deletion of your information</li>
                      <li>Object to processing of your information</li>
                      <li>Request data portability</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We use session storage and local storage for:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Maintaining your login session</li>
                      <li>Storing invite code validation status</li>
                      <li>Remembering your preferences</li>
                      <li>Enhancing platform functionality</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
                  <div className="text-white/80">
                    <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
                  <div className="text-white/80">
                    <p>If you have any questions about this Privacy Policy, please contact us through our platform or reach out to our support team.</p>
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