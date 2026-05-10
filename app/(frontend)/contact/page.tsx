import { CmdHeader } from "@/components/primitives/CmdHeader";
import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  const fields: Array<[string, string]> = [
    ["[email]", "bartek@67projects.app"],
    ["[twitter]", "@bartek67"],
    ["[github]", "bartek-filipiuk"],
    ["[linkedin]", "in/bartek67"],
    ["[response_sla]", "< 24h on weekdays"],
    ["[location]", "Warsaw, PL — UTC+1"],
  ];
  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ padding: "56px 0 8px" }}>
        <CmdHeader cmd="cat /etc/contact.conf" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            border: "2px solid var(--border)",
            margin: "12px 0 24px",
          }}
        >
          {fields.map(([k, v]) => (
            <div
              key={k}
              style={{
                padding: "16px 18px",
                borderRight: "1px dashed var(--border)",
                borderBottom: "1px dashed var(--border)",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "32px 0 10px" }}>
          # or-leave-a-message
        </h3>
        <ContactForm />
      </section>
    </main>
  );
}
