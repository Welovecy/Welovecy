import { FB_GROUP, FB_PAGE } from "@/lib/site";

/** The We Love Cyprus Facebook group: a simple invite, no tracking scripts. */
export function Community({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="community-line">
        <span>Questions the guide doesn&apos;t answer? Ask the locals.</span>
        <a className="btn btn-ghost" href={FB_GROUP} target="_blank" rel="noopener noreferrer">Join the group</a>
      </div>
    );
  }
  return (
    <section className="wrap" aria-labelledby="h-community">
      <div className="panel" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", alignItems: "center" }}>
        <div style={{ display: "grid", gap: 10 }}>
          <h2 id="h-community" style={{ fontSize: "clamp(28px,4vw,40px)" }}>Ask the people who live here.</h2>
          <p className="muted">Join the We Love Cyprus group on Facebook, the island&apos;s biggest community. Real answers from locals, expats and regular visitors.</p>
        </div>
        <div className="actions">
          <a className="btn btn-primary" href={FB_GROUP} target="_blank" rel="noopener noreferrer">Join the group</a>
          <a className="btn btn-ghost" href={FB_PAGE} target="_blank" rel="noopener noreferrer">Follow the Page</a>
        </div>
      </div>
    </section>
  );
}
