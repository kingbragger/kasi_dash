import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-xl font-black mb-4 text-white">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl font-black mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-2">Last updated: January 2025</p>
          <p className="text-muted-foreground mb-10 text-sm">
            This policy applies to Kasi Dash (Pty) Ltd, operating at <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a>.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-10">
            <p className="text-sm font-semibold text-primary mb-1">POPIA Compliance Notice</p>
            <p className="text-sm text-muted-foreground">
              Kasi Dash is committed to protecting your personal information in accordance with the
              <strong className="text-white"> Protection of Personal Information Act (POPIA), No. 4 of 2013</strong> of
              South Africa. As a responsible party, we process your personal information lawfully,
              minimally, and with your rights in mind.
            </p>
          </div>

          <Section title="1. Who We Are">
            <p>Kasi Dash is a South African township delivery platform that connects customers, local vendors, and drivers. Our registered contact is <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a>.</p>
          </Section>

          <Section title="2. What Personal Information We Collect">
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Identity information:</strong> full name, ID number (for driver applications)</li>
              <li><strong className="text-white">Contact information:</strong> email address, phone number</li>
              <li><strong className="text-white">Location data:</strong> pickup and delivery addresses; real-time GPS for active drivers</li>
              <li><strong className="text-white">Transaction data:</strong> order details, payment status, delivery history</li>
              <li><strong className="text-white">Application data:</strong> vehicle registration, licence numbers, business information (for vendor applications)</li>
              <li><strong className="text-white">Technical data:</strong> browser type, device information, IP address (standard web server logs)</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information (Purpose Specification, POPIA §13)">
            <p>We use your personal information only for the following specified, explicit and legitimate purposes:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Processing and fulfilling delivery orders</li>
              <li>Communicating order status and delivery updates</li>
              <li>Processing payments and maintaining transaction records</li>
              <li>Verifying and onboarding drivers and vendors</li>
              <li>Live driver tracking during active deliveries</li>
              <li>Responding to enquiries and support requests</li>
              <li>Sending relevant service notifications (not marketing without consent)</li>
              <li>Complying with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing">
            <p>Under POPIA, we process your personal information on the following grounds:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Contract performance:</strong> processing necessary to deliver your order</li>
              <li><strong className="text-white">Legitimate interest:</strong> fraud prevention, safety of drivers and customers</li>
              <li><strong className="text-white">Consent:</strong> marketing communications (you may withdraw at any time)</li>
              <li><strong className="text-white">Legal obligation:</strong> tax, financial and regulatory compliance</li>
            </ul>
          </Section>

          <Section title="5. Sharing Your Information">
            <p>We do not sell your personal information. We may share it with:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Drivers:</strong> your name, phone number and delivery address are shared with the assigned driver only</li>
              <li><strong className="text-white">Ozow:</strong> our South African payment processor for secure EFT transactions</li>
              <li><strong className="text-white">Hosting providers:</strong> our platform runs on secure cloud infrastructure</li>
              <li><strong className="text-white">Law enforcement:</strong> when legally required by South African law</li>
            </ul>
          </Section>

          <Section title="6. Driver Location Tracking">
            <p>Active drivers on the Kasi Dash platform share their GPS location during active deliveries. This location is:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Only broadcast when the driver explicitly activates "Go Live"</li>
              <li>Visible to the assigned customer and Kasi Dash administrators only</li>
              <li>Not retained beyond the active delivery session in identifiable form</li>
            </ul>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain personal information only as long as necessary for the original purpose or as required by law:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Order records:</strong> 5 years (financial/tax compliance)</li>
              <li><strong className="text-white">Driver applications:</strong> 12 months after decision</li>
              <li><strong className="text-white">Driver GPS logs:</strong> 30 days rolling</li>
              <li><strong className="text-white">Waitlist emails:</strong> until you unsubscribe or ask to be removed</li>
            </ul>
          </Section>

          <Section title="8. Your Rights Under POPIA">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-white">Right of access:</strong> request a copy of the information we hold about you</li>
              <li><strong className="text-white">Right to correction:</strong> request that incorrect information be corrected</li>
              <li><strong className="text-white">Right to deletion:</strong> request that your information be deleted, subject to legal retention requirements</li>
              <li><strong className="text-white">Right to object:</strong> object to certain types of processing</li>
              <li><strong className="text-white">Right to lodge a complaint:</strong> with the Information Regulator of South Africa</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a>.</p>
            <p><strong className="text-white">Information Regulator (South Africa):</strong> <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">inforegulator.org.za</a> · complaints.IR@justice.gov.za</p>
          </Section>

          <Section title="9. Security">
            <p>We implement appropriate technical and organisational measures to protect your personal information, including encrypted HTTPS connections, hashed passwords, and access controls. No system is 100% secure, and we will notify you in the event of a data breach as required by POPIA.</p>
          </Section>

          <Section title="10. Cookies & Tracking">
            <p>We use session cookies necessary for the functioning of the platform (login sessions). We do not use advertising or third-party tracking cookies.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this policy from time to time. Material changes will be communicated via the platform or by email. Continued use of Kasi Dash after changes constitutes acceptance.</p>
          </Section>

          <Section title="12. Contact">
            <p>For all privacy-related queries and requests:<br />
            Email: <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a></p>
          </Section>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
