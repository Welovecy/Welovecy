import Link from "next/link";
import { photoFor, listingHref } from "@/lib/data";
import { insideOf } from "@/lib/views";
import { Photo } from "./Photo";

/** "In this hotel": venues inside the building, shown before anything down the road. */
export function InHotel({ hotelId, hotelName, place }: { hotelId: string; hotelName: string; place?: boolean }) {
  const list = insideOf(hotelId);
  if (!list.length) return null;
  return (
    <section className="wrap" aria-labelledby="h-in" style={{ paddingBottom: 8 }}>
      <h2 id="h-in" style={{ fontSize: 28, marginBottom: 16 }}>{place ? "Eat and drink here" : "In this hotel"}</h2>
      <div className="inhotel">
        {list.map((b) => {
          const ph = photoFor(`biz-${b.i}`);
          return (
            <Link key={b.i} href={listingHref(b.i)} className="inhotel-card">
              {ph ? <Photo photo={ph} label={b.n} tint="#2E6E8E" ratio="16/9" /> : null}
              <div className="inhotel-body">
                <p className="eyebrow">{[b.fl, b.vt ? b.vt[0].toUpperCase() + b.vt.slice(1) : b.l].filter(Boolean).join(" · ")}</p>
                <h3>{b.n}</h3>
                <p className="muted small">{place ? `Inside ${hotelName}.` : `Inside ${hotelName}. No walk, just the lift.`}</p>
                {b.hrs ? <p className="small">{b.hrs}</p> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
