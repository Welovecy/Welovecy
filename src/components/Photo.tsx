import type { Photo as P } from "@/lib/types";
import { CamIcon } from "./Icons";

interface Props {
  photo?: P;
  label: string;
  tint: string;
  ratio?: string;
  priority?: boolean;
  hero?: boolean;
  className?: string;
}

/** Photograph with credit, or a labelled tint panel until a photo is supplied. */
export function Photo({ photo, label, tint, ratio, priority, hero, className }: Props) {
  const src = photo ? (!hero && photo.u.includes("/1280px-") ? photo.u.replace("/1280px-", "/960px-") : photo.u) : "";
  const style = { ["--tint" as string]: tint, ...(ratio ? { ["--ratio" as string]: ratio } : {}) };
  return (
    <div className={`photo${photo ? " has-img" : ""}${className ? " " + className : ""}`} style={style}>
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={photo.t} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : undefined} />
          {photo.a ? <span className="credit">{photo.a} · {photo.l}</span> : null}
        </>
      ) : (
        <span className="cap" role="img" aria-label={`Photo to come: ${label}`}><CamIcon />Photo to come: {label}</span>
      )}
    </div>
  );
}
