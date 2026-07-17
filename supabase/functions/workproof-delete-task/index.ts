import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  try {
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    if (!token) return reply({ error: "Authentication required." }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: callerAuth } = await admin.auth.getUser(token);
    if (!callerAuth.user) return reply({ error: "Invalid session." }, 401);

    const { task_id: taskId } = await req.json();
    if (!taskId) return reply({ error: "Task is required." }, 400);

    const { data: task, error: taskError } = await admin
      .from("tasks")
      .select("id,organisation_id,created_by,task_number")
      .eq("id", taskId)
      .maybeSingle();
    if (taskError || !task) return reply({ error: "Task not found." }, 404);

    const { data: membership } = await admin
      .from("organisation_members")
      .select("role,active")
      .eq("organisation_id", task.organisation_id)
      .eq("user_id", callerAuth.user.id)
      .eq("active", true)
      .maybeSingle();

    const allowed = membership?.role === "owner" ||
      (membership?.role === "manager" && task.created_by === callerAuth.user.id);
    if (!allowed) return reply({ error: "You may delete only tasks you created." }, 403);

    const { data: evidence, error: evidenceError } = await admin
      .from("task_evidence")
      .select("storage_path")
      .eq("task_id", task.id);
    if (evidenceError) return reply({ error: "Could not verify task evidence." }, 500);

    const paths = (evidence || []).map((item) => item.storage_path).filter(Boolean);
    if (paths.length) {
      const { error: storageError } = await admin.storage.from("task-evidence").remove(paths);
      if (storageError) return reply({ error: "Could not remove the task photographs." }, 500);
    }

    const { error: deleteError } = await admin
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .eq("organisation_id", task.organisation_id);
    if (deleteError) return reply({ error: "Could not delete the task." }, 500);

    return reply({ deleted: true, task_number: task.task_number });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Could not delete the task." }, 400);
  }
});
