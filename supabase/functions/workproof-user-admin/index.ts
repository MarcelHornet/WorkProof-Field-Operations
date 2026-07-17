import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
const usernameFor = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    if (!token) return reply({ error: "Authentication required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: callerAuth } = await admin.auth.getUser(token);
    if (!callerAuth.user) return reply({ error: "Invalid session" }, 401);
    const { data: caller } = await admin.from("organisation_members").select("organisation_id,role,active").eq("user_id", callerAuth.user.id).eq("active", true).limit(1).single();
    if (!caller || !["owner", "manager"].includes(caller.role)) return reply({ error: "User administration access denied" }, 403);
    const body = await req.json();
    const action = String(body.action || "create");
    if (action === "create") {
      const fullName = String(body.full_name || "").trim();
      const username = usernameFor(String(body.username || fullName));
      const role = String(body.role || "worker");
      const password = String(body.password || "");
      if (!fullName || username.length < 3 || password.length < 8) return reply({ error: "Full name, unique username and an 8-character password are required." }, 400);
      if (!["owner", "manager", "team_lead", "worker"].includes(role)) return reply({ error: "Invalid role" }, 400);
      if (caller.role === "manager" && ["owner","manager"].includes(role)) return reply({ error: "Only owners can create owners or managers." }, 403);
      const syntheticEmail = `${username}@users.workproof.internal`;
      const { data: created, error: createError } = await admin.auth.admin.createUser({ email: syntheticEmail, password, email_confirm: true, user_metadata: { full_name: fullName, username, phone: body.phone || null, title: body.title || null, must_change_password: true }, app_metadata: { organisation_id: caller.organisation_id, role } });
      if (createError || !created.user) return reply({ error: createError?.message || "Could not create user" }, 400);
      const userId = created.user.id;
      const { error: profileError } = await admin.from("profiles").update({ username, full_name: fullName, phone: body.phone || null, title: body.title || null, active: true, must_change_password: true, revoked_at: null }).eq("id", userId);
      const { error: memberError } = await admin.from("organisation_members").insert({ organisation_id: caller.organisation_id, user_id: userId, role, active: true });
      if (profileError || memberError) { await admin.auth.admin.deleteUser(userId); return reply({ error: profileError?.message || memberError?.message }, 400); }
      if (body.team_id) await admin.from("team_members").upsert({ organisation_id: caller.organisation_id, team_id: body.team_id, user_id: userId, is_lead: role === "team_lead" });
      return reply({ user_id: userId, username });
    }
    const targetId = String(body.user_id || "");
    const { data: target } = await admin.from("organisation_members").select("role,active").eq("organisation_id", caller.organisation_id).eq("user_id", targetId).single();
    if (!target) return reply({ error: "User not found" }, 404);
    if (targetId === callerAuth.user.id) return reply({ error: "You cannot revoke your own account." }, 400);
    if (caller.role === "manager" && !["team_lead", "worker"].includes(target.role)) return reply({ error: "Managers can administer workers and team leaders only." }, 403);
    if (action === "revoke") {
      await admin.from("organisation_members").update({ active: false }).eq("organisation_id", caller.organisation_id).eq("user_id", targetId);
      await admin.from("profiles").update({ active: false, revoked_at: new Date().toISOString() }).eq("id", targetId);
      await admin.auth.admin.updateUserById(targetId, { password: crypto.randomUUID()+crypto.randomUUID() });
      return reply({ success: true });
    }
    if (action === "reactivate") {
      if (String(body.password || "").length < 8) return reply({ error: "A new password of at least 8 characters is required." }, 400);
      await admin.from("organisation_members").update({ active: true }).eq("organisation_id", caller.organisation_id).eq("user_id", targetId);
      await admin.from("profiles").update({ active: true, revoked_at: null, must_change_password: true }).eq("id", targetId);
      await admin.auth.admin.updateUserById(targetId, { password: body.password });
      return reply({ success: true });
    }
    if (action === "reset_password") {
      if (String(body.password || "").length < 8) return reply({ error: "A new password of at least 8 characters is required." }, 400);
      await admin.auth.admin.updateUserById(targetId, { password: body.password });
      await admin.from("profiles").update({ must_change_password: true }).eq("id", targetId);
      return reply({ success: true });
    }
    return reply({ error: "Unknown action" }, 400);
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "User administration failed." }, 400);
  }
});
