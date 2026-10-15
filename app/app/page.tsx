import { currentUser } from "@/lib/session";
import { listTransfers } from "@/lib/transfers-server";
import { toPublic } from "@/lib/transfer";
import { Transfers } from "@/components/Transfers";
export const dynamic = "force-dynamic";
export default async function AppHome() { const u = (await currentUser())!; return <Transfers initial={(await listTransfers(u.id, u.demo)).map(toPublic)} />; }
