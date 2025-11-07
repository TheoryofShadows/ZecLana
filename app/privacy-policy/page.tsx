import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ChevronRight } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Your right to financial privacy is fundamental. Zolana was built around that principle.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last updated: January 2025</p>
        </div>

        {/* Quick Links */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 mb-12">
          <h2 className="font-semibold mb-4">Quick Overview</h2>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2">
              <ChevronRight size={16} className="text-primary" />
              <span>We collect ZERO personal information</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight size={16} className="text-primary" />
              <span>No KYC, no identity verification, no email required</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight size={16} className="text-primary" />
              <span>End-to-end encryption for all transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight size={16} className="text-primary" />
              <span>Zcash shielding hides sender, receiver, and amount</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* 1. Data Collection */}
          <section>
            <h2 className="text-2xl font-bold mb-4">1. What Data We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Absolutely nothing that identifies you.</strong> Zolana is designed for complete anonymity.
              </p>
              <div className="bg-muted/50 border border-border rounded p-4">
                <p className="font-semibold mb-2">We do NOT collect:</p>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  <li>Names, emails, phone numbers, or addresses</li>
                  <li>Identification documents or KYC data</li>
                  <li>IP addresses or device fingerprints (logging disabled)</li>
                  <li>Transaction metadata that identifies you</li>
                  <li>Cookies that track you across sessions</li>
                  <li>Location data or browsing history</li>
                </ul>
              </div>
              <p>
                <strong>What we may temporarily store:</strong> Anonymous transaction hashes, encrypted wallet
                addresses, and anonymized usage metrics (no linking to identity).
              </p>
            </div>
          </section>

          {/* 2. How We Use Data */}
          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Information</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Since we collect zero personal data, we cannot use it for:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Marketing or advertising</li>
                <li>Profiling or behavior tracking</li>
                <li>Selling or sharing with third parties</li>
                <li>Creating user profiles or segments</li>
                <li>Targeted ads or personalization</li>
              </ul>
              <p className="pt-4">We only use anonymized, aggregated data to:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Monitor system health and prevent abuse</li>
                <li>Improve performance and reliability</li>
                <li>Comply with blockchain analysis requirements (without identifying users)</li>
              </ul>
            </div>
          </section>

          {/* 3. Encryption */}
          <section>
            <h2 className="text-2xl font-bold mb-4">3. Encryption & Security</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>All transactions are encrypted end-to-end.</strong> We use military-grade AES-256 encryption.
              </p>
              <div className="bg-secondary/10 border border-secondary/20 rounded p-4">
                <p className="font-semibold mb-2">Privacy Layers:</p>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>
                    <strong>Zcash Shielding:</strong> Sender, receiver, and amount completely hidden on-chain
                  </li>
                  <li>
                    <strong>End-to-End Encryption:</strong> Only you can decrypt your transaction data
                  </li>
                  <li>
                    <strong>Solana Bridge:</strong> Fast settlement without exposing payment relationships
                  </li>
                  <li>
                    <strong>Zero Metadata Leakage:</strong> No IP logs, no session tracking, no fingerprints
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 4. Third Parties */}
          <section>
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Zolana uses only essential third-party services, all privacy-conscious:</p>
              <div className="space-y-3">
                <div className="border border-border rounded p-3">
                  <p className="font-semibold text-sm mb-1">Supabase (Database)</p>
                  <p className="text-sm">
                    Encrypted data storage. We do not grant them access to unencrypted user information.
                  </p>
                </div>
                <div className="border border-border rounded p-3">
                  <p className="font-semibold text-sm mb-1">Solana Blockchain</p>
                  <p className="text-sm">
                    Public ledger. Your transactions are shielded by Zcash, not visible on public blockchain.
                  </p>
                </div>
                <div className="border border-border rounded p-3">
                  <p className="font-semibold text-sm mb-1">Helius RPCs</p>
                  <p className="text-sm">
                    We use Helius for blockchain data—they do not identify you, only route transaction data.
                  </p>
                </div>
                <div className="border border-border rounded p-3">
                  <p className="font-semibold text-sm mb-1">Stripe (Payments)</p>
                  <p className="text-sm">
                    Optional fiat on-ramps only. We do NOT store payment info; Stripe handles all PII separately.
                  </p>
                </div>
              </div>
              <p className="pt-4">
                <strong>None of these services can identify you through Zolana.</strong>
              </p>
            </div>
          </section>

          {/* 5. Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Since we have no data on you, you have:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>Right to anonymity:</strong> You need not provide any information
                </li>
                <li>
                  <strong>Right to deletion:</strong> Any session data is deleted automatically
                </li>
                <li>
                  <strong>Right to access:</strong> You can verify we have no data on you
                </li>
                <li>
                  <strong>Right to opt-out:</strong> Stop using Zolana at any time with zero trace
                </li>
                <li>
                  <strong>Right to anonymity in Blockchain:</strong> Zcash shielding guarantees this
                </li>
              </ul>
            </div>
          </section>

          {/* 6. Compliance */}
          <section>
            <h2 className="text-2xl font-bold mb-4">6. Regulatory Compliance</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Zolana complies with financial regulations through <strong>privacy-preserving methods</strong>:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong>AML Compliance:</strong> Behavioral analysis without requiring identity
                </li>
                <li>
                  <strong>Sanctions Screening:</strong> Pattern detection without personal data
                </li>
                <li>
                  <strong>GDPR Compliance:</strong> Zero personal data = zero GDPR obligations
                </li>
                <li>
                  <strong>Bitcoin Traceability:</strong> Blockchain analysis without deanonymizing users
                </li>
              </ul>
              <p className="pt-4">We achieve compliance without compromising privacy—the way it should be.</p>
            </div>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4">7. Data Retention</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>Session data:</strong> Automatically deleted after 30 days of inactivity
              </p>
              <p>
                <strong>Transaction hashes:</strong> Retained for 6 months for dispute resolution, then permanently
                deleted
              </p>
              <p>
                <strong>Encrypted wallet addresses:</strong> Linked only to transaction hash, not to identity
              </p>
              <p>
                <strong>Metadata:</strong> Fully purged; we do not retain logs, IP addresses, or session IDs
              </p>
            </div>
          </section>

          {/* 8. Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>If we ever change this policy in a way that reduces your privacy, we will:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Post the changes prominently on our site</li>
                <li>Give you 30 days to delete your account before the change takes effect</li>
                <li>Never automatically agree you to reduced privacy</li>
              </ul>
            </div>
          </section>

          {/* 9. Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact & Transparency</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Questions about your privacy or how Zolana works?</p>
              <p>
                Email: <strong>privacy@zolana.io</strong>
              </p>
              <p>
                <strong>We will never ask for personal information to address privacy concerns.</strong> We can help
                anonymously.
              </p>
            </div>
          </section>

          {/* Final Note */}
          <section className="bg-primary/10 border border-primary/20 rounded-lg p-6">
            <h3 className="font-bold mb-2">Our Promise</h3>
            <p className="text-muted-foreground">
              Financial privacy is a human right. Zolana will never compromise on this principle. We are audited
              annually by independent privacy experts, and our source code is open for review. Your privacy is not
              negotiable.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
