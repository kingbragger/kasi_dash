import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface Me {
  name: string;
  email: string;
  role: string;
  idNumber?: string;
}

export default function BuildforgeContract() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  const contractRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/buildforge/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAuthenticated) { navigate("/buildforge/login"); return; }
        if (d.mustChangePassword) { navigate("/buildforge/change-password"); return; }
        if (!d.profileCompleted) { navigate("/buildforge/complete-profile"); return; }
        return fetch("/api/buildforge/profile", { credentials: "include" }).then((r) => r.json());
      })
      .then((data) => { if (data) setMe(data); })
      .catch(() => navigate("/buildforge/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handlePrint = () => window.print();

  const today = new Date().toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric"
  });

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!me) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #contract-printable, #contract-printable * { visibility: visible !important; }
          #contract-printable {
            position: fixed !important;
            inset: 0 !important;
            background: white !important;
            color: black !important;
            padding: 48px 56px !important;
            font-size: 13px !important;
            line-height: 1.7 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Screen controls */}
      <div className="no-print min-h-screen bg-background text-foreground">
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/buildforge/portal")} className="text-sm text-muted-foreground hover:text-white transition-colors">
              Back to Portal
            </button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/10 hover:border-primary gap-2" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground font-bold hover:brightness-110 gap-2" onClick={handlePrint}>
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>
        <div className="flex justify-center py-8 px-4">
          <div className="bg-white text-black rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <ContractBody me={me} today={today} />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground pb-8">
          Use the Download PDF button above. Your browser will open a print dialog where you can save as PDF.
        </p>
      </div>

      {/* Printable version */}
      <div id="contract-printable" ref={contractRef} style={{ display: "none", background: "white", color: "black" }}>
        <ContractBody me={me} today={today} />
      </div>
    </>
  );
}

function ContractBody({ me, today }: { me: Me; today: string }) {
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", color: "#111", padding: "48px 56px", lineHeight: 1.75 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #b8952a", paddingBottom: 24, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ background: "#111", borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center" }}>
            <img src="/buildforge-logo.png" alt="BuildForge" style={{ height: 36, display: "block" }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#b8952a", letterSpacing: 1, fontFamily: "Arial, sans-serif" }}>BUILDFORGE</div>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "Arial, sans-serif", letterSpacing: 0.5 }}>A Kasi Dash Initiative</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "Arial, sans-serif" }}>Kasi Dash (Pty) Ltd</div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "Arial, sans-serif" }}>unity@kasidash.co.za</div>
          <div style={{ fontSize: 11, color: "#888", fontFamily: "Arial, sans-serif" }}>kasidash.co.za</div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "Arial, sans-serif", color: "#111" }}>
          BuildForge Core Team Member Agreement
        </div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 6, fontFamily: "Arial, sans-serif" }}>
          Confidential Service Agreement
        </div>
      </div>

      {/* Parties */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>1. Parties to This Agreement</SectionTitle>
        <p style={{ marginBottom: 10 }}>
          This Core Team Member Agreement (the <strong>"Agreement"</strong>) is entered into on <strong>{today}</strong> between:
        </p>
        <div style={{ background: "#f8f6f0", border: "1px solid #e0d5b0", borderRadius: 8, padding: "16px 20px", marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Kasi Dash (Pty) Ltd</p>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: 12 }}>Operating as BuildForge | unity@kasidash.co.za | kasidash.co.za</p>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: 12 }}>Hereinafter referred to as <strong>"The Company"</strong></p>
        </div>
        <p style={{ textAlign: "center", fontWeight: 700, color: "#888", margin: "10px 0" }}>AND</p>
        <div style={{ background: "#f8f6f0", border: "1px solid #e0d5b0", borderRadius: 8, padding: "16px 20px" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{me.name}</p>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: 12 }}>{me.email} | Role: {me.role}</p>
          <p style={{ margin: "4px 0 0", color: "#555", fontSize: 12 }}>Hereinafter referred to as <strong>"The Member"</strong></p>
        </div>
      </section>

      {/* Purpose */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>2. Purpose and Scope of Engagement</SectionTitle>
        <p>
          The Company engages The Member as an independent core team contributor under the BuildForge programme. BuildForge is a skills based selection system where developers, designers, and marketers work on real client projects on behalf of the Company. The Member agrees to perform services in their capacity as a <strong>{me.role}</strong> as directed by the Company.
        </p>
        <p style={{ marginTop: 10 }}>
          This Agreement does not constitute an employment contract. The Member is engaged as an independent contributor and is not entitled to employee benefits, leave pay, or statutory employment protections beyond those expressly stated herein.
        </p>
      </section>

      {/* Payment */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>3. Remuneration and Payment Terms</SectionTitle>
        <p>
          The Member shall be remunerated on a <strong>monthly basis</strong>. Payment amounts are determined solely at the discretion of the Company and are calculated according to the volume, quality, and complexity of work completed by The Member during each calendar month.
        </p>
        <p style={{ marginTop: 10 }}>
          The following revenue sharing structure applies to all projects assigned to and completed by The Member:
        </p>
        <div style={{ background: "#fffbec", border: "2px solid #b8952a", borderRadius: 8, padding: "16px 20px", margin: "14px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: "#b8952a" }}>The Member receives</p>
              <p style={{ margin: "2px 0 0", color: "#555", fontSize: 12 }}>Based on work completed and approved by The Company</p>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#b8952a" }}>50%</div>
          </div>
          <div style={{ borderTop: "1px solid #e0d5b0", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 14 }}>Kasi Dash retains</p>
              <p style={{ margin: "2px 0 0", color: "#555", fontSize: 12 }}>Platform, infrastructure, client acquisition and operational costs</p>
            </div>
            <div style={{ fontSize: 36, fontWeight: 900 }}>50%</div>
          </div>
        </div>
        <p>
          Payments will be made directly to the bank account provided by The Member through the member portal. The Company reserves the right to withhold payment in the event of incomplete, substandard, or disputed work until the matter is resolved.
        </p>
      </section>

      {/* Work standards */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>4. Work Standards and Conduct</SectionTitle>
        <p>The Member agrees to:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 6 }}>Complete all assigned projects to a professional standard within the timelines communicated by The Company.</li>
          <li style={{ marginBottom: 6 }}>Maintain regular communication with The Company regarding project progress, blockers, and updates.</li>
          <li style={{ marginBottom: 6 }}>Not misrepresent their work, qualifications, or capacity to deliver.</li>
          <li style={{ marginBottom: 6 }}>Treat all clients, team members, and Company representatives with respect and professionalism.</li>
          <li style={{ marginBottom: 6 }}>Use only approved tools, platforms, and communication channels for project work.</li>
        </ul>
      </section>

      {/* Confidentiality */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>5. Confidentiality</SectionTitle>
        <p>
          The Member agrees to keep all client information, project details, business processes, pricing structures, and internal communications strictly confidential during and after the term of this Agreement. The Member shall not share, publish, or disclose any such information to third parties without the express written consent of The Company.
        </p>
      </section>

      {/* IP */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>6. Intellectual Property</SectionTitle>
        <p>
          All work product, code, designs, copy, and other deliverables created by The Member in the performance of services under this Agreement shall be the sole and exclusive property of Kasi Dash (Pty) Ltd, and by extension the applicable client where applicable. The Member irrevocably assigns all intellectual property rights in such work to The Company upon creation.
        </p>
      </section>

      {/* Termination */}
      <section style={{ marginBottom: 28 }}>
        <SectionTitle>7. Termination</SectionTitle>
        <p>
          Either party may terminate this Agreement at any time by providing written notice. In the event of termination, The Member shall be entitled to payment for all work satisfactorily completed up to the date of termination. The Company reserves the right to terminate this Agreement immediately and without notice in cases of misconduct, breach of confidentiality, or gross negligence.
        </p>
      </section>

      {/* Governing law */}
      <section style={{ marginBottom: 36 }}>
        <SectionTitle>8. Governing Law</SectionTitle>
        <p>
          This Agreement shall be governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising from this Agreement shall first be subject to good faith negotiation between the parties before any formal legal proceedings are initiated.
        </p>
      </section>

      {/* Signatures */}
      <div style={{ borderTop: "2px solid #e0d5b0", paddingTop: 28, marginTop: 8 }}>
        <p style={{ fontWeight: 700, marginBottom: 24, fontFamily: "Arial, sans-serif" }}>Signatures</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4, fontFamily: "Arial, sans-serif", fontSize: 13 }}>For Kasi Dash (Pty) Ltd</p>
            <div style={{ borderBottom: "1.5px solid #333", height: 48, marginBottom: 8 }} />
            <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Authorised Signatory</p>
            <p style={{ fontSize: 11, color: "#555", margin: "2px 0 0" }}>Kasi Dash / BuildForge</p>
            <p style={{ fontSize: 11, color: "#555", margin: "2px 0 0" }}>Date: __________________________</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4, fontFamily: "Arial, sans-serif", fontSize: 13 }}>{me.name}</p>
            <div style={{ borderBottom: "1.5px solid #333", height: 48, marginBottom: 8 }} />
            <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Core Team Member | {me.role}</p>
            <p style={{ fontSize: 11, color: "#555", margin: "2px 0 0" }}>{me.email}</p>
            <p style={{ fontSize: 11, color: "#555", margin: "2px 0 0" }}>Date: __________________________</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e0d5b0", marginTop: 40, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 10, color: "#aaa", margin: 0, fontFamily: "Arial, sans-serif" }}>
          BuildForge Core Team Member Agreement | Generated {today}
        </p>
        <p style={{ fontSize: 10, color: "#aaa", margin: 0, fontFamily: "Arial, sans-serif" }}>
          Kasi Dash (Pty) Ltd | kasidash.co.za
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: "Arial, sans-serif", fontWeight: 800, fontSize: 13,
      textTransform: "uppercase", letterSpacing: 1, color: "#b8952a",
      borderLeft: "4px solid #b8952a", paddingLeft: 10, marginBottom: 12, marginTop: 0
    }}>
      {children}
    </h3>
  );
}
