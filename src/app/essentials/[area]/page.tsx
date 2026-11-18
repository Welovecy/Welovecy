import { redirect } from "next/navigation";
import { DESTINATIONS } from "@/lib/data";

export const dynamicParams = false;
export function generateStaticParams() { return DESTINATIONS.map((d) => ({ area: d.id })); }

export default async function AreaEssentials({ params }: { params: Promise<{ area: string }> }) {
  redirect(`/essentials/${(await params).area}/pharmacy`);
}
