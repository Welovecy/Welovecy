import { WhereSearch } from "./WhereSearch";

export function StayPanel({ dest, destName }: { dest: string; destName: string }) {
  return (
    <div className="panel">
      <h3 style={{ fontSize: 22 }}>Staying here, or thinking about it?</h3>
      <p className="muted">Search any hotel to see the beaches, sights and essentials around it, with distances, before you book or when you arrive.</p>
      <WhereSearch scope="stay" dest={dest} placeholder={`Search a hotel in ${destName}`} label={`Search a hotel in ${destName}`} />
    </div>
  );
}
