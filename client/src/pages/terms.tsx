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
              </div>

              {/* Content */}
              <div className="prose prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                  <div className="text-white/80 space-y-4">
                    <p>By accessing and using the MLVS District platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    <p>If you do not agree to abide by the above, please do not use this service.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">2. Invite-Only Access</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Access to MLVS District is strictly by invitation only:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Valid invite codes are required for platform access</li>
                      <li>Invite codes are single-use and cannot be shared or transferred</li>
                      <li>Unauthorized attempts to access the platform are prohibited</li>
                      <li>We reserve the right to revoke access at any time</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">3. User Conduct</h2>
                  <div className="text-white/80 space-y-4">
                    <p>By using our platform, you agree to:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Use the service for lawful purposes only</li>
                      <li>Not attempt to circumvent security measures</li>
                      <li>Not engage in any activity that disrupts the service</li>
                      <li>Not reverse engineer or attempt to extract source code</li>
                      <li>Respect the intellectual property rights of others</li>
                      <li>Maintain the confidentiality of your access credentials</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                  <div className="text-white/80 space-y-4">
                    <p>The MLVS District platform and its content are protected by intellectual property laws:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>All content, features, and functionality are owned by MLVS District</li>
                      <li>You may not copy, modify, or distribute any part of the platform</li>
                      <li>Trademarks, logos, and service marks are property of their respective owners</li>
                      <li>User-generated content remains your property but grants us usage rights</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">5. Privacy and Data Protection</h2>
                  <div className="text-white/80 space-y-4">
                    <p>Your privacy is important to us:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>We collect and process data as outlined in our Privacy Policy</li>
                      <li>We implement security measures to protect your information</li>
                      <li>We do not sell or share personal data with unauthorized parties</li>
                      <li>You have rights regarding your personal data as described in our Privacy Policy</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">6. Service Availability</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We strive to maintain service availability but cannot guarantee:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Uninterrupted access to the platform</li>
                      <li>Error-free operation at all times</li>
                      <li>Compatibility with all devices or browsers</li>
                      <li>Availability during maintenance periods</li>
                    </ul>
                    <p>We reserve the right to modify, suspend, or discontinue the service with or without notice.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
                  <div className="text-white/80 space-y-4">
                    <p>To the fullest extent permitted by law:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>MLVS District shall not be liable for any indirect, incidental, or consequential damages</li>
                      <li>Our total liability shall not exceed the amount paid by you for the service</li>
                      <li>We are not responsible for third-party content or services</li>
                      <li>You use the service at your own risk</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">8. Indemnification</h2>
                  <div className="text-white/80">
                    <p>You agree to indemnify and hold harmless MLVS District from any claims, damages, or expenses arising from your use of the platform, violation of these terms, or infringement of any rights of another party.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
                  <div className="text-white/80 space-y-4">
                    <p>We may terminate or suspend your access immediately:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>For violation of these terms</li>
                      <li>For suspected fraudulent or illegal activity</li>
                      <li>At our sole discretion with or without cause</li>
                      <li>If required by law or legal authority</li>
                    </ul>
                    <p>Upon termination, your right to use the service ceases immediately.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
                  <div className="text-white/80">
                    <p>These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or use of the service shall be subject to the exclusive jurisdiction of competent courts.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
                  <div className="text-white/80">
                    <p>We reserve the right to modify these terms at any time. Material changes will be communicated through the platform or by email. Continued use after changes constitutes acceptance of the new terms.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
                  <div className="text-white/80">
                    <p>For questions about these Terms of Service, please contact us through our platform support system or reach out to our legal team for formal inquiries.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4">13. Severability</h2>
                  <div className="text-white/80">
                    <p>If any provision of these terms is found to be unenforceable or invalid, the remaining provisions will continue to be valid and enforceable to the fullest extent permitted by law.</p>
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