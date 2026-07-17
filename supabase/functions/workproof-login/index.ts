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
    const { identifier, password } = await req.json();
    const login = String(identifier || "").trim().toLowerCase();
    if (!login || String(password || "").length < 8) return reply({ error: "Enter a valid username and password." }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    let query = admin.from("profiles").select("id,active").eq("active", true);
    if (login.includes("@")) query = query.ilike("email", login);
    else if (/^[+0-9 ()-]{8,}$/.test(login)) query = query.eq("phone", login);
    else query = query.eq("username", login);
    const { data: profile, error: profileError } = await query.maybeSingle();
    if (profileError || !profile) return reply({ error: "Incorrect username or password." }, 401);
    const { data: membership } = await admin.from("organisation_members").select("active").eq("user_id", profile.id).eq("active", true).limit(1).maybeSingle();
    if (!membership) return reply({ error: "This account has been revoked." }, 403);
    const { data: authUser, error: userError } = await admin.auth.admin.getUserById(profile.id);
    if (userError || !authUser.user?.email) return reply({ error: "Account login is not configured." }, 400);
    const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false } });
    const { data, error } = await auth.auth.signInWithPassword({ email: authUser.user.email, password });
    if (error || !data.session) return reply({ error: "Incorrect username or password." }, 401);
    return reply({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "Unable to sign in." }, 400);
  }
});
