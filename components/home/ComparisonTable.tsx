/** Category-level comparison — never named competitors, since those claims can't be
 *  verified here. Scrolls horizontally inside its own container so the page body never
 *  scrolls sideways on a phone. */
const ROWS: { capability: string; rec: string; chat: string; tryon: string }[] = [
  { capability: "Shows the garment on the shopper", rec: "no", chat: "no", tryon: "yes" },
  { capability: "Reasons about a complete outfit", rec: "no", chat: "Partial", tryon: "no" },
  { capability: "Garment-role validation before render", rec: "n/a", chat: "n/a", tryon: "Varies" },
  { capability: "Inventory-aware suggestions", rec: "yes", chat: "no", tryon: "no" },
  { capability: "Missing-piece detection for merchandising", rec: "no", chat: "no", tryon: "no" },
  { capability: "Keeps your storefront and analytics", rec: "yes", chat: "Varies", tryon: "yes" },
];

function Cell({ value }: { value: string }) {
  if (value === "yes") return <td className="cmp-yes">✓<span className="home-visually-hidden">Yes</span></td>;
  if (value === "no") return <td className="cmp-no">✗<span className="home-visually-hidden">No</span></td>;
  return <td className="cmp-part">{value}</td>;
}

export default function ComparisonTable() {
  return (
    <>
      <div className="cmp-scroll">
        <table className="cmp">
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col">Rec engine</th>
              <th scope="col">AI chatbot</th>
              <th scope="col">Try-on only</th>
              <th scope="col" className="cmp-us">STYLD</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.capability}>
                <th scope="row">{row.capability}</th>
                <Cell value={row.rec} />
                <Cell value={row.chat} />
                <Cell value={row.tryon} />
                <td className="cmp-us-cell">✓<span className="home-visually-hidden">Yes</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cmp-note">
        An in-house build is possible — garment-role validation, avatar reuse and a
        generate-then-review quality loop are the parts that take real engineering time.
      </p>
    </>
  );
}
