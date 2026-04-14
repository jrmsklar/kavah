import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Kavah",
  description: "Terms of Service for the Kavah community matchmaking platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: April 14, 2026</p>

        <div className="mt-10 space-y-8 text-sm text-ink-2 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the Kavah platform (&ldquo;Service&rdquo;), operated by
              Kavah (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, you may not
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              2. Description of Service
            </h2>
            <p>
              Kavah is a community matchmaking platform that connects individuals
              through video-based profiles. Community matchmakers personally
              review member responses and facilitate introductions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              3. Eligibility
            </h2>
            <p>
              You must be at least 18 years of age to use the Service. By creating
              an account, you represent and warrant that you are at least 18 years
              old and that all information you provide is accurate and truthful.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              4. Account Registration
            </h2>
            <p>
              To use the Service, you must create an account using a valid phone
              number. You are responsible for maintaining the confidentiality of
              your account and for all activities that occur under your account.
              You agree to notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              5. SMS Communications &amp; Text Messaging
            </h2>
            <p>
              By providing your phone number and creating an account, you
              expressly consent to receive SMS text messages from Kavah. These
              messages may include:
            </p>
            <ul className="mt-3 ml-4 space-y-1.5 list-disc">
              <li>One-time verification codes for account sign-in</li>
              <li>Account security notifications</li>
              <li>Match introductions and updates from your matchmaker</li>
              <li>Important service announcements</li>
            </ul>
            <p className="mt-3">
              <strong className="text-ink">Message frequency:</strong> Message
              frequency varies. You may receive messages when signing in, when
              matched, or for important account notifications.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Opt-out:</strong> You can opt out of
              SMS messages at any time by replying <strong className="text-ink">STOP</strong> to
              any message you receive from us. After opting out, you will receive
              a one-time confirmation message. Please note that opting out of SMS
              may affect your ability to sign in and use certain features of the
              Service.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Help:</strong> For help with SMS
              messages, reply <strong className="text-ink">HELP</strong> to any message or
              contact us at{" "}
              <a href="mailto:support@joinkavah.com" className="text-gold hover:underline">
                support@joinkavah.com
              </a>.
            </p>
            <p className="mt-3">
              <strong className="text-ink">Message and data rates may apply.</strong>{" "}
              Your carrier&apos;s standard messaging and data rates may apply to
              any messages you send or receive. Kavah is not responsible for any
              charges from your wireless provider.
            </p>
            <p className="mt-3">
              Compatible carriers include but are not limited to AT&amp;T, T-Mobile,
              Verizon, Sprint, and most major US and Canadian carriers. Carriers
              are not liable for delayed or undelivered messages.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              6. User Content
            </h2>
            <p>
              You retain ownership of all content you submit to the Service,
              including video responses, text answers, and profile information
              (&ldquo;User Content&rdquo;). By submitting User Content, you grant Kavah a
              non-exclusive, worldwide, royalty-free license to use, store,
              display, and process your User Content solely for the purpose of
              operating and providing the Service.
            </p>
            <p className="mt-3">
              You agree not to submit content that is unlawful, defamatory,
              harassing, threatening, or otherwise objectionable. We reserve the
              right to remove any User Content that violates these terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              7. Video Responses
            </h2>
            <p>
              Video responses you record as part of a community&apos;s join flow are
              shared only with the community&apos;s matchmaker(s) and authorized
              administrators. Your videos are not publicly visible, are not shared
              with other members, and are not used for advertising or marketing
              purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              8. Prohibited Conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-3 ml-4 space-y-1.5 list-disc">
              <li>Use the Service for any unlawful purpose</li>
              <li>Impersonate another person or misrepresent your identity</li>
              <li>Harass, abuse, or harm another person</li>
              <li>Collect or store personal data about other users without their consent</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Create multiple accounts for deceptive purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              9. Termination
            </h2>
            <p>
              We may suspend or terminate your account at any time, with or
              without cause, and with or without notice. You may also delete your
              account at any time by contacting us at{" "}
              <a href="mailto:support@joinkavah.com" className="text-gold hover:underline">
                support@joinkavah.com
              </a>. Upon termination, your right to use the Service will
              immediately cease, and we may delete your User Content.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              10. Disclaimers
            </h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, whether express or implied. We do not
              guarantee that the Service will be uninterrupted, secure, or
              error-free. We make no representations about the suitability of any
              match or introduction.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              11. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Kavah shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising out of or related to your use of the Service,
              including but not limited to any interactions or meetings with other
              members.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              12. Changes to Terms
            </h2>
            <p>
              We may update these Terms of Service from time to time. If we make
              material changes, we will notify you by posting the updated terms on
              this page with a revised &ldquo;Last updated&rdquo; date. Your continued use of
              the Service after such changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-medium text-ink mb-3">
              13. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms of Service, please
              contact us at{" "}
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
