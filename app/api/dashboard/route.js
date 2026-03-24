import { getDashboardData } from "@/services/db";

export async function GET(request) {
  try {
    const data = await getDashboardData();
    return Response.json({ success: true, data });
  } catch (e) {
    if (e.message === "Not authenticated") {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    return Response.json({ error: e.message }, { status: 500 });
  }
}
