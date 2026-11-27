/** Categories that are indoors, for "something to do when it rains". */
export const INDOOR_CATS = new Set(["Museum", "Art museum", "Art gallery", "Aquarium", "Planetarium", "Indoor attraction", "Theatre", "Shopping centre", "Cinema", "Arts centre", "Arts centre and venue", "Visitor centre", "Information centre"]);
export const isIndoor = (cat?: string) => !!cat && INDOOR_CATS.has(cat);
