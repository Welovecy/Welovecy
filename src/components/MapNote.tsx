import { EMAIL_HELLO, absolute } from "@/lib/site";

const mail = (subject: string, body: string) =>
  `mailto:${EMAIL_HELLO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** One quiet line under "what's around" lists: we are still mapping, and visitors can tell us what's off. */
export function MapNote({ style }: { style?: React.CSSProperties }) {
  return (
    <p className="tag map-note" style={style}>
      We&apos;re still mapping some places, so a few nearby spots may be missing or slightly off. Spotted one?{" "}
      <a href={mail("Map fix", "What's missing or in the wrong place?\n\n")} data-ev="Map fix" data-ev-target="around">Tell us</a>
    </p>
  );
}

/** "Wrong location?" on a listing: an email with the page already filled in. */
export function ReportPin({ name, href }: { name: string; href: string }) {
  return (
    <p className="tag map-note">
      <a href={mail(`Wrong location: ${name}`, `Page: ${absolute(href)}\n\nWhat's wrong with the location or details?\n\n`)} data-ev="Map fix" data-ev-target={href}>
        Wrong location or details? Tell us
      </a>
    </p>
  );
}

/** The mail link behind "Something wrong? Tell us" on detail pages. */
export const reportMail = (name: string, href: string) =>
  mail(`Wrong location or details: ${name}`, `Page: ${absolute(href)}\n\nWhat's wrong?\n\n`);
