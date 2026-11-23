import type { DestId, LL } from "./types";

/** Rough centre of each area, used to find the nearest area for any point and for the weather. */
export const DEST_CENTRE: Record<DestId, LL> = {
  ayianapa: [34.9875, 33.9995], protaras: [35.017, 34.05], paphos: [34.775, 32.43], akamas: [35.03, 32.43],
  limassol: [34.68, 33.04], larnaca: [34.915, 33.63], nicosia: [35.17, 33.36], troodos: [34.94, 32.86],
};
