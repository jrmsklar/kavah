import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Kavah",
  description: "Privacy Policy for the Kavah community matchmaking platform.",
};

export default function PrivacyPage() {
  return (
    <>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3.5">
          <div className="w-20" />
          <Link href="/" className="font-serif text-xl font-medium text-ink">
            kavah
          </Link>
          <div className="w-20 flex justify-end">
            <Link
              href="https://app.joinkavah.com"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 transition"
            >
              Join
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-ink">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: April 14, 2026</p>

        <div className="mt-10 space-y-8 text-sm text-ink-2 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              1. Introduction
            </h2>
            <p>
              Kavah (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use the Kavah platform
              (&ldquo;Service&rdquo;), including our website and mobile applications.
            </p>
            <p className="mt-3">
              By using the Service, you consent to the collection and use of your
              information as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              2. Information We Collect
            </h2>

            <h3 className="font-semibold text-ink mt-4 mb-2">
              Information you provide directly
            </h3>
            <ul className="ml-4 space-y-1.5 list-disc">
              <li>
                <strong className="text-ink">Account information:</strong> first name, last
                name, phone number, date of birth, height, and city
              </li>
              <li>
                <strong className="text-ink">Profile responses:</strong> text answers and
                video recordings submitted as part of a community&apos;s join flow
              </li>
              <li>
                <strong className="text-ink">Communications:</strong> messages you send to us
                for support or feedback
              </li>
            </ul>

            <h3 className="font-semibold text-ink mt-4 mb-2">
              Information collected automatically
            </h3>
            <ul className="ml-4 space-y-1.5 list-disc">
              <li>
                <strong className="text-ink">Usage data:</strong> pages visited, features
                used, timestamps, and interaction patterns
              </li>
              <li>
                <strong className="text-ink">Device information:</strong> browser type,
                operating system, and device identifiers
              </li>
              <li>
                <strong className="text-ink">Analytics:</strong> we use PostHog to collect
                anonymized usage analytics and session recordings to improve the
                Service. Session recordings are only active in production and are
                limited to identified users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="mt-3 ml-4 space-y-1.5 list-disc">
              <li>Create and manage your account</li>
              <li>Verify your identity via phone number</li>
              <li>Enable community matchmakers to review your profile and facilitate introductions</li>
              <li>Send you account-related SMS messages (verification codes, match notifications, service updates)</li>
              <li>Improve and personalize the Service</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect, prevent, and address fraud or technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              4. Phone Number &amp; SMS Privacy
            </h2>
            <p>
              Your phone number is collected for account authentication and
              communication purposes. We use your phone number to:
            </p>
            <ul className="mt-3 ml-4 space-y-1.5 list-disc">
              <li>Send one-time verification codes when you sign in</li>
              <li>Send account security notifications</li>
              <li>Notify you of match introductions from your matchmaker</li>
              <li>Send important service announcements</li>
            </ul>
            <p className="mt-3">
              <strong className="text-ink">We do not sell, rent, or share your phone
              number with third parties for marketing purposes.</strong> Your phone
              number is only shared with our authentication provider (Clerk) for
              verification and our messaging provider for delivering SMS messages.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Opt-out:</strong> You can opt out of SMS
              messages at any time by replying <strong className="text-ink">STOP</strong> to
              any message. For help, reply <strong className="text-ink">HELP</strong> or
              email us at{" "}
              <a href="mailto:support@joinkavah.com" className="text-gold hover:underline">
                support@joinkavah.com
              </a>.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Message and data rates may apply.</strong>{" "}
              Standard messaging and data rates from your wireless carrier may
              apply. Kavah is not responsible for fees charged by your carrier.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              5. How We Share Your Information
            </h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="mt-3 ml-4 space-y-1.5 list-disc">
              <li>
                <strong className="text-ink">Community matchmakers:</strong> Your profile
                information and video responses are shared with the matchmaker(s)
                and authorized administrators of communities you join. This is the
                core purpose of the Service.
              </li>
              <li>
                <strong className="text-ink">Service providers:</strong> We share data with
                third-party providers who help us operate the Service, including
                Clerk (authentication), Supabase (database and storage), and
                PostHog (analytics). These providers are bound by their own
                privacy policies and process data on our behalf.
              </li>
              <li>
                <strong className="text-ink">Legal requirements:</strong> We may disclose
                your information if required to do so by law or in response to
                valid legal process.
              </li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties. Your
              video responses are never shared with other members, used for
              advertising, or made publicly accessible.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              6. Data Storage &amp; Security
            </h2>
            <p>
              Your data is stored securely using industry-standard practices. Account
              data is stored in our database hosted by Supabase. Video responses
              are stored in encrypted cloud storage with signed, time-limited
              access URLs. Authentication is managed by Clerk with secure session
              handling.
            </p>
            <p className="mt-3">
              While we take reasonable measures to protect your information, no
              method of transmission over the Internet or electronic storage is
              100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              7. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as your account is
              active or as needed to provide you the Service. If you request
              account deletion, we will delete your personal information and video
              responses within 30 days, except where we are required to retain
              data for legal or legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              8. Your Rights
            </h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="mt-3 ml-4 space-y-1.5 list-disc">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of SMS communications by replying STOP</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@joinkavah.com" className="text-gold hover:underline">
                support@joinkavah.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed to individuals under 18 years of age. We
              do not knowingly collect personal information from children. If we
              become aware that we have collected information from a child under
              18, we will take steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              10. Cookies &amp; Tracking
            </h2>
            <p>
              We use essential cookies for authentication and session management.
              We use PostHog for product analytics, which may set cookies to
              identify returning users. We do not use third-party advertising
              cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              material changes, we will update the &ldquo;Last updated&rdquo; date at the top
              of this page. Your continued use of the Service after changes are
              posted constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at{" "}
              <a href="mailto:support@joinkavah.com" className="text-gold hover:underline">
                support@joinkavah.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-warm">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-sm text-ink-3">kavah</span>
          <div className="flex items-center gap-4 text-xs text-ink-3">
            <Link href="/terms" className="hover:text-ink-2 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-ink-2 transition">Privacy</Link>
          </div>
          <p className="text-xs text-ink-3">&copy; 2026 Kavah</p>
        </div>
      </footer>
    </>
  );
}
