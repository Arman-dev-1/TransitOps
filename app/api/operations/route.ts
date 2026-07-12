import { getOperationsSnapshot } from "../../lib/operations";
import { requireSession } from "../../lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return Response.json({ data: await getOperationsSnapshot() });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Unable to load Transit Ops data", error);
    return Response.json(
      { error: "Transit Ops database is unavailable. Run the Prisma migration before using live operations data." },
      { status: 503 },
    );
  }
}
