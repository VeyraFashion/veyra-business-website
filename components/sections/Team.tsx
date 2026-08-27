import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";

const TEAM = [
  {
    initials: "ST",
    name: "Shobhit Tulshain",
    role: "Founder",
    bio: "Building the AI layer that lets a storefront offer real try-on and styling, not just a size chart — focused on product and platform architecture.",
    tone: "coral" as const,
  },
  {
    initials: "OG",
    name: "Omkar Ghugarkar",
    role: "Co-Founder",
    bio: "Working to take EditMe's styling and try-on engine from a consumer app to a platform retail teams can license and integrate.",
    tone: "teal" as const,
  },
];

export default function Team() {
  return (
    <section className="wrap section" id="team">
      <Reveal className="section-head center">
        <div className="feature-kicker" style={{ textAlign: "center" }}>Team</div>
        <h2 className="section-title">Small on purpose, for now.</h2>
        <p className="section-sub">Two people, close enough to the model outputs to keep every claim on this site honest.</p>
      </Reveal>

      <RevealGroup className="team-grid" stagger={0.1}>
        {TEAM.map((person) => (
          <RevealItem key={person.name} className="card team-card">
            <div className={`avatar avatar-${person.tone}`} aria-hidden="true">{person.initials}</div>
            <h4>{person.name}</h4>
            <div className="team-role">{person.role}</div>
            <p>{person.bio}</p>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="pricing-footnote">Bios are placeholders while the site is early — happy to swap in real backgrounds once finalized.</p>
    </section>
  );
}
