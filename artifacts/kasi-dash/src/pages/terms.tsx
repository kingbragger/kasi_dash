import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="text-xl font-black mb-4 text-white">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl font-black mb-2">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground mb-10 text-sm">Last updated: January 2025 · Governing law: Republic of South Africa</p>

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using the Kasi Dash platform (website, mobile interface, or API), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the platform. These terms apply to customers, drivers, vendors, and all other users.</p>
          </Section>

          <Section title="2. About Kasi Dash">
            <p>Kasi Dash is a South African township delivery platform that facilitates last-mile delivery between customers, vendors, and independent delivery drivers. Kasi Dash acts as a platform intermediary and is not a transport or logistics company.</p>
            <p>Contact: <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a></p>
          </Section>

          <Section title="3. Platform Services">
            <p>Kasi Dash provides:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>An online ordering interface for delivery requests</li>
              <li>A marketplace of vendor catalogues and product listings</li>
              <li>Driver matching and real-time order tracking</li>
              <li>Payment processing via Ozow (South African EFT)</li>
              <li>Order receipts and delivery confirmation</li>
            </ul>
            <p>Kasi Dash does not guarantee specific delivery times, as these are subject to driver availability and operational conditions.</p>
          </Section>

          <Section title="4. Pricing & Payments">
            <p>All prices displayed on the platform are in South African Rand (ZAR) and inclusive of VAT where applicable. Payment is processed securely via Ozow. By placing an order, you authorise the payment of the stated amount.</p>
            <p><strong className="text-white">Vendor / Store Listing Fee:</strong> Listing your store or catalogue on the Kasi Dash platform costs <strong className="text-primary">R250 per month</strong> per active listing. This fee is billed in advance and is non-refundable once a listing period has commenced.</p>
            <p>Delivery fees are calculated at checkout and shown before payment confirmation.</p>
          </Section>

          <Section title="5. Refund & Cancellation Policy">
            <p><strong className="text-white">Orders:</strong> You may cancel an order before a driver has accepted it. Once accepted, cancellations are subject to a cancellation fee equal to 20% of the order value. Delivered orders are non-refundable except where items are materially incorrect or damaged in transit, subject to a dispute being raised within 24 hours.</p>
            <p><strong className="text-white">Vendor Listings:</strong> Monthly listing fees are non-refundable. Listings may be cancelled with 30 days' written notice to avoid the next billing cycle.</p>
            <p>To raise a dispute or request a refund, contact <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a> within 24 hours of delivery.</p>
          </Section>

          <Section title="6. Driver Terms">
            <p>Independent drivers using the Kasi Dash platform agree to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Maintain a valid South African driver's licence for the vehicle type operated</li>
              <li>Operate a roadworthy and legally registered vehicle</li>
              <li>Comply with all South African traffic laws and regulations</li>
              <li>Maintain public liability insurance appropriate to their operations</li>
              <li>Handle customer parcels with due care and not tamper with contents</li>
              <li>Share accurate real-time GPS location during active deliveries</li>
            </ul>
            <p>Drivers are independent contractors, not employees of Kasi Dash. Kasi Dash is not liable for a driver's actions, accidents, or failure to deliver.</p>
          </Section>

          <Section title="7. Vendor Terms">
            <p>Vendors listing catalogues on the platform agree to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Provide accurate, lawful product listings and pricing</li>
              <li>Not list counterfeit, illegal, or prohibited goods</li>
              <li>Pay the applicable monthly listing fee of R250 per active catalogue</li>
              <li>Maintain product availability and update stock status promptly</li>
            </ul>
            <p>Kasi Dash reserves the right to remove listings that violate these terms without refund.</p>
          </Section>

          <Section title="8. Prohibited Use">
            <p>You may not use Kasi Dash to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Order, transport or sell illegal goods or substances</li>
              <li>Commit fraud or provide false information</li>
              <li>Harass, threaten or abuse drivers, vendors or staff</li>
              <li>Attempt to hack, overload or disrupt the platform</li>
              <li>Circumvent payment processing</li>
            </ul>
          </Section>

          <Section title="9. Liability Limitation">
            <p>To the maximum extent permitted by South African law, Kasi Dash's liability for any claim arising from platform use is limited to the value of the specific order in dispute. Kasi Dash is not liable for indirect, consequential, or special damages, loss of profit, or loss of data.</p>
          </Section>

          <Section title="10. Intellectual Property">
            <p>All content, branding, and technology on the Kasi Dash platform is the property of Kasi Dash (Pty) Ltd. You may not reproduce, copy, or distribute any part of the platform without written permission.</p>
          </Section>

          <Section title="11. Governing Law & Dispute Resolution">
            <p>These terms are governed by the laws of the Republic of South Africa. Any disputes shall first be attempted to be resolved amicably by contacting <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a>. Unresolved disputes will be subject to the jurisdiction of the South Gauteng High Court.</p>
          </Section>

          <Section title="12. Consumer Protection">
            <p>Nothing in these terms affects your rights under the South African Consumer Protection Act (CPA), No. 68 of 2008, or any other applicable consumer protection legislation.</p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>We reserve the right to update these terms. Continued use of the platform after changes are published constitutes acceptance. Material changes will be communicated via email or prominent notice on the platform.</p>
          </Section>

          <Section title="14. Contact">
            <p>For all queries: <a href="mailto:unity@kasidash.co.za" className="text-primary hover:underline">unity@kasidash.co.za</a></p>
          </Section>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
