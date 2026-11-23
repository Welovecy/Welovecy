import { CLIMATE, MONTHS, monthVerdict } from "./weather";
import type { DestId } from "./types";

/** Plain-English copy for "Cyprus in <month>", written from the long-term averages so it never drifts from the data. */
export const MONTH_SLUGS = MONTHS.map((m) => m.toLowerCase());
export const monthIndex = (slug: string) => MONTH_SLUGS.indexOf(slug);

const COAST: DestId[] = ["ayianapa", "protaras", "larnaca", "limassol", "paphos", "akamas"];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const r = Math.round;
const span = (xs: number[]) => { const a = r(Math.min(...xs)), b = r(Math.max(...xs)); return a === b ? `${a}°` : `${a} to ${b}°`; };

export function monthCopy(m: number) {
  const M = MONTHS[m];
  const hi = COAST.map((d) => CLIMATE[d].hi[m]), lo = COAST.map((d) => CLIMATE[d].lo[m]);
  const sea = COAST.map((d) => CLIMATE[d].sea?.[m]).filter((x): x is number => x != null);
  const rain = COAST.map((d) => CLIMATE[d].rain[m]);
  const sun = COAST.map((d) => CLIMATE[d].sun[m] / DAYS[m]);
  const tro = CLIMATE.troodos, nic = CLIMATE.nicosia;
  const seaMax = Math.max(...sea), seaMin = Math.min(...sea), hiAvg = hi.reduce((a, b) => a + b) / hi.length;
  const rainAvg = rain.reduce((a, b) => a + b) / rain.length, sunAvg = sun.reduce((a, b) => a + b) / sun.length;

  const swim =
    seaMin >= 24 ? `Yes, easily. The sea is around ${span(sea)}, warm enough for long, lazy swims.`
    : seaMin >= 22 ? `Yes. The sea averages ${span(sea)}, which most people find comfortable for a proper swim.`
    : seaMax >= 20 ? `Some will. The sea is around ${span(sea)}: refreshing rather than warm. Fine for a quick dip on a sunny afternoon, chilly for long swims.`
    : `Only if you like it bracing. The sea is around ${span(sea)}, so most visitors stick to a heated hotel pool.`;

  const heat =
    hiAvg >= 31 ? `Hot. Days on the coast average ${span(hi)}, and inland Nicosia reaches about ${r(nic.hi[m])}°. Plan beaches for the morning and late afternoon, and sightseeing early.`
    : hiAvg >= 26 ? `Properly warm. Days on the coast average ${span(hi)}, with nights around ${span(lo)}.`
    : hiAvg >= 21 ? `Warm and comfortable. Days on the coast average ${span(hi)}, nights cool to around ${span(lo)}.`
    : hiAvg >= 17 ? `Mild. Expect days of ${span(hi)} on the coast and cooler nights around ${span(lo)}. Sunny days still feel warm.`
    : `Cool by Cyprus standards. Days on the coast average ${span(hi)} and nights drop to around ${span(lo)}.`;

  const wet =
    rainAvg < 0.5 ? `Rain is very unlikely. The coast averages less than one rainy day all month.`
    : rainAvg < 2.5 ? `Mostly dry. The coast averages about ${r(rainAvg)} rainy day${r(rainAvg) === 1 ? "" : "s"} in ${M}.`
    : rainAvg < 6 ? `Some rain is likely, around ${r(rainAvg)} rainy days on the coast, usually as showers between sunny spells.`
    : `This is one of the wetter months, with around ${r(rainAvg)} rainy days on the coast. Most days still have sunshine.`;

  const pack =
    hiAvg >= 28 ? "Light clothes, a hat, high-factor sun cream and water for days out. A thin layer for air-conditioned places."
    : hiAvg >= 23 ? "Summer clothes for the day and a light layer for the evening."
    : hiAvg >= 18 ? "Layers: T-shirts for sunny afternoons, a jumper or light jacket for evenings, and something waterproof just in case."
    : "A warm jacket and layers, plus a waterproof. Bring proper warm clothes if you're heading up to Troodos.";

  const mountains =
    tro.lo[m] <= 2 ? `Cold. Troodos averages ${r(tro.hi[m])}° by day and ${r(tro.lo[m])}° at night, and snow is possible on the higher slopes.`
    : tro.hi[m] >= 25 ? `Cooler than the coast. Troodos averages ${r(tro.hi[m])}° by day, a good escape from the heat.`
    : `Fresh. Troodos averages ${r(tro.hi[m])}° by day and ${r(tro.lo[m])}° at night, so take a warm layer.`;

  const good: string[] = [];
  if (seaMin >= 22) good.push("Swimming");
  if (hiAvg >= 22 && rainAvg < 2.5) good.push("Beach days");
  if (hiAvg >= 15 && hiAvg <= 27) good.push("Walking and hiking");
  if (hiAvg <= 28) good.push("Sightseeing");
  if (tro.lo[m] <= 1) good.push("Snow in Troodos");
  if (hiAvg < 22 && rainAvg >= 2.5) good.push("Quieter beaches and sights");

  const lead = `Days around ${span(hi)} on the coast, nights around ${span(lo)}, ${sea.length ? `the sea at ${span(sea)}` : ""} and about ${r(sunAvg)} hours of sunshine a day.`;
  return { M, lead, swim, heat, wet, pack, mountains, good, verdict: (d: DestId) => monthVerdict(CLIMATE[d], m) };
}
