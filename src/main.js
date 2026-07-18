/* WorkProof production application with the original interface and Supabase backend. */

import { supabase, configured } from "./supabase.js";

const STORAGE_KEY = "workproof_mvp_v1";
const SESSION_KEY = "workproof_session_v1";

const icons = {
  dashboard: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>`,
  tasks: `<svg class="icon" viewBox="0 0 24 24"><path d="M9 5h11M9 12h11M9 19h11"/><path d="m3.5 5 1 1 2-2M3.5 12l1 1 2-2M3.5 19l1 1 2-2"/></svg>`,
  projects: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2"/></svg>`,
  sites: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 21V8l8-5 8 5v13"/><path d="M8 21v-7h8v7M9 9h.01M15 9h.01"/></svg>`,
  teams: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  reports: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`,
  settings: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.36.21.74.2 1.12V10a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>`,
  logout: `<svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>`,
  menu: `<svg class="icon" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  bell: `<svg class="icon" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  clock: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  warning: `<svg class="icon" viewBox="0 0 24 24"><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 18h.01"/></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24"><path d="m4 12 5 5L20 6"/></svg>`,
  eye: `<svg class="icon" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  camera: `<svg class="icon" viewBox="0 0 24 24"><path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4.5Z"/><circle cx="12" cy="12.5" r="4"/></svg>`,
  users: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>`,
  building: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 21h18M6 21V5l6-2v18M18 21V9l-6-2M8 7h1M8 11h1M8 15h1M15 11h1M15 15h1"/></svg>`,
  arrow: `<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>`,
  trash: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 10v7M14 10v7"/></svg>`,
  close: `<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  upload: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/></svg>`,
  play: `<svg class="icon" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7V5Z"/></svg>`,
  block: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></svg>`,
  download: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>`,
  reset: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>`,
  chevron: `<svg class="icon" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>`,
  briefcase: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>`,
  location: `<svg class="icon" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  calendar: `<svg class="icon" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  more: `<svg class="icon" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>`,
  shield: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  file: `<svg class="icon" viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6Z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></svg>`
};

function injectIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    const key = el.dataset.icon;
    if (icons[key]) el.innerHTML = icons[key];
  });
}

const today = new Date();
const isoDate = (offset = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const isoTime = (offsetHours = 0) => new Date(Date.now() + offsetHours * 3600000).toISOString();

function placeholderImage(label, toneA = "#374151", toneB = "#111827") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${toneA}"/><stop offset="1" stop-color="${toneB}"/></linearGradient><pattern id="p" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="rgba(255,255,255,.08)"/></pattern></defs><rect width="900" height="650" fill="url(#g)"/><rect width="900" height="650" fill="url(#p)"/><circle cx="720" cy="100" r="150" fill="rgba(245,158,11,.22)"/><rect x="90" y="180" width="720" height="280" rx="28" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)"/><path d="M160 385 310 255l120 100 92-80 210 110" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><circle cx="650" cy="245" r="45" fill="rgba(245,158,11,.75)"/><text x="90" y="555" fill="white" font-family="Arial" font-size="34" font-weight="700">${label}</text><text x="90" y="595" fill="rgba(255,255,255,.65)" font-family="Arial" font-size="20">WorkProof evidence capture</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const seedData = {
  workspace: {
    name: "Albert Group Operations",
    pilot: true,
    createdAt: isoTime(-720)
  },
  businesses: [
    { id: "b1", name: "AutoCity Group", code: "ACG", type: "Dealership Group" },
    { id: "b2", name: "De Pecan Valley", code: "DPV", type: "Venue & Farm" },
    { id: "b3", name: "Property Portfolio", code: "PROP", type: "Commercial Property" },
    { id: "b4", name: "Grill King Building", code: "GKB", type: "Commercial Property" }
  ],
  sites: [
    { id: "s1", businessId: "b1", name: "AutoCity Heidelberg", location: "Heidelberg, Gauteng", managerId: "u2" },
    { id: "s2", businessId: "b1", name: "AutoCity Alberton", location: "Alberton, Gauteng", managerId: "u3" },
    { id: "s3", businessId: "b1", name: "AutoCity Nigel", location: "Nigel, Gauteng", managerId: "u2" },
    { id: "s4", businessId: "b2", name: "De Pecan Valley", location: "Outside Heidelberg", managerId: "u2" },
    { id: "s5", businessId: "b3", name: "Main Street Properties", location: "Heidelberg CBD", managerId: "u3" },
    { id: "s6", businessId: "b4", name: "Grill King Building", location: "Heidelberg, Gauteng", managerId: "u2" }
  ],
  users: [
    { id: "u1", name: "Oom Albert", role: "owner", title: "Owner", initials: "OA", phone: "+27 82 000 0001", active: true },
    { id: "u2", name: "Pieter Botha", role: "manager", title: "Construction Manager", initials: "PB", phone: "+27 82 000 0002", active: true },
    { id: "u3", name: "Johan van Wyk", role: "manager", title: "Construction Manager", initials: "JV", phone: "+27 82 000 0003", active: true },
    { id: "u4", name: "Thabo Mokoena", role: "lead", title: "Team Leader", initials: "TM", phone: "+27 82 000 0004", teamId: "t1", active: true },
    { id: "u5", name: "Sipho Dlamini", role: "worker", title: "Construction Worker", initials: "SD", phone: "+27 82 000 0005", teamId: "t1", active: true },
    { id: "u6", name: "Kagiso Ndlovu", role: "worker", title: "Construction Worker", initials: "KN", phone: "+27 82 000 0006", teamId: "t1", active: true },
    { id: "u7", name: "Mandla Khumalo", role: "lead", title: "Team Leader", initials: "MK", phone: "+27 82 000 0007", teamId: "t2", active: true },
    { id: "u8", name: "Elias Mabuza", role: "worker", title: "Maintenance Worker", initials: "EM", phone: "+27 82 000 0008", teamId: "t2", active: true },
    { id: "u9", name: "Frans du Toit", role: "worker", title: "Electrician", initials: "FD", phone: "+27 82 000 0009", teamId: "t3", active: true },
    { id: "u10", name: "Lucas Mthembu", role: "worker", title: "Painter", initials: "LM", phone: "+27 82 000 0010", teamId: "t2", active: true }
  ],
  teams: [
    { id: "t1", name: "Construction Team Alpha", managerId: "u2", leadId: "u4", memberIds: ["u4", "u5", "u6"], trade: "General Construction" },
    { id: "t2", name: "Maintenance Team Bravo", managerId: "u3", leadId: "u7", memberIds: ["u7", "u8", "u10"], trade: "Maintenance & Finishes" },
    { id: "t3", name: "Electrical & Technical", managerId: "u2", leadId: "u9", memberIds: ["u9"], trade: "Electrical" }
  ],
  projects: [
    { id: "p1", name: "Heidelberg Workshop Upgrade", businessId: "b1", siteId: "s1", managerId: "u2", status: "active", startDate: isoDate(-18), endDate: isoDate(32), budget: 280000 },
    { id: "p2", name: "Venue Readiness Programme", businessId: "b2", siteId: "s4", managerId: "u2", status: "active", startDate: isoDate(-7), endDate: isoDate(70), budget: 95000 },
    { id: "p3", name: "CBD Property Maintenance", businessId: "b3", siteId: "s5", managerId: "u3", status: "active", startDate: isoDate(-40), endDate: isoDate(60), budget: 180000 },
    { id: "p4", name: "Grill King Building Repairs", businessId: "b4", siteId: "s6", managerId: "u2", status: "active", startDate: isoDate(-5), endDate: isoDate(25), budget: 120000 }
  ],
  tasks: [
    {
      id: "WP-1042", title: "Replace damaged workshop roof sheets", description: "Remove the damaged sheets above bay three, replace with matching IBR sheets and seal all joins. Keep the work area barricaded.",
      businessId: "b1", siteId: "s1", projectId: "p1", managerId: "u2", teamId: "t1", assigneeId: "u5", createdBy: "u2", priority: "urgent", status: "awaiting-review", dueDate: isoDate(0), createdAt: isoTime(-72), startedAt: isoTime(-30), submittedAt: isoTime(-2), requiredEvidence: ["before", "during", "after"],
      evidence: [
        { id: "e1", type: "before", note: "Damage before removal", image: placeholderImage("Before · roof damage", "#7c2d12", "#431407"), uploadedBy: "u5", uploadedAt: isoTime(-28) },
        { id: "e2", type: "during", note: "New sheets positioned", image: placeholderImage("During · replacement", "#1e3a8a", "#172554"), uploadedBy: "u5", uploadedAt: isoTime(-8) },
        { id: "e3", type: "after", note: "Work completed and sealed", image: placeholderImage("After · completed roof", "#065f46", "#022c22"), uploadedBy: "u5", uploadedAt: isoTime(-2) }
      ],
      timeline: [
        { type: "created", text: "Task created by Pieter Botha", at: isoTime(-72) },
        { type: "assigned", text: "Assigned to Sipho Dlamini and Construction Team Alpha", at: isoTime(-70) },
        { type: "started", text: "Work started", at: isoTime(-30) },
        { type: "submitted", text: "Submitted with three evidence items", at: isoTime(-2) }
      ]
    },
    {
      id: "WP-1041", title: "Repair paving at venue entrance", description: "Lift uneven paving at the guest entrance, restore the base and relay paving level with adjacent surface.",
      businessId: "b2", siteId: "s4", projectId: "p2", managerId: "u2", teamId: "t2", assigneeId: "u8", createdBy: "u2", priority: "high", status: "in-progress", dueDate: isoDate(1), createdAt: isoTime(-45), startedAt: isoTime(-18), requiredEvidence: ["before", "after"], evidence: [
        { id: "e4", type: "before", note: "Uneven paving captured", image: placeholderImage("Before · paving", "#78350f", "#451a03"), uploadedBy: "u8", uploadedAt: isoTime(-17) }
      ],
      timeline: [
        { type: "created", text: "Task created by Pieter Botha", at: isoTime(-45) },
        { type: "started", text: "Work started by Elias Mabuza", at: isoTime(-18) }
      ]
    },
    {
      id: "WP-1040", title: "Paint rear office passage", description: "Prepare surfaces, repair cracks and apply two coats of washable white paint to rear office passage.",
      businessId: "b1", siteId: "s2", projectId: null, managerId: "u3", teamId: "t2", assigneeId: "u10", createdBy: "u3", priority: "medium", status: "assigned", dueDate: isoDate(3), createdAt: isoTime(-20), requiredEvidence: ["before", "after"], evidence: [],
      timeline: [{ type: "created", text: "Task created and assigned by Johan van Wyk", at: isoTime(-20) }]
    },
    {
      id: "WP-1039", title: "Replace faulty outside light", description: "Diagnose and replace faulty light at the eastern parking entrance. Confirm operation after dark if possible.",
      businessId: "b4", siteId: "s6", projectId: "p4", managerId: "u2", teamId: "t3", assigneeId: "u9", createdBy: "u2", priority: "high", status: "overdue", dueDate: isoDate(-2), createdAt: isoTime(-96), requiredEvidence: ["after"], evidence: [],
      timeline: [{ type: "created", text: "Task assigned to Frans du Toit", at: isoTime(-96) }]
    },
    {
      id: "WP-1038", title: "Service workshop roller door", description: "Inspect tracks, lubricate moving components, tighten brackets and test the safety stop.",
      businessId: "b1", siteId: "s3", projectId: null, managerId: "u2", teamId: "t1", assigneeId: "u6", createdBy: "u2", priority: "medium", status: "approved", dueDate: isoDate(-1), createdAt: isoTime(-120), startedAt: isoTime(-72), submittedAt: isoTime(-28), completedAt: isoTime(-24), requiredEvidence: ["after"], evidence: [
        { id: "e5", type: "after", note: "Door serviced and tested", image: placeholderImage("After · roller door", "#064e3b", "#022c22"), uploadedBy: "u6", uploadedAt: isoTime(-28) }
      ],
      timeline: [
        { type: "created", text: "Task created by Pieter Botha", at: isoTime(-120) },
        { type: "started", text: "Work started by Kagiso Ndlovu", at: isoTime(-72) },
        { type: "submitted", text: "Submitted for review", at: isoTime(-28) },
        { type: "approved", text: "Approved by Pieter Botha", at: isoTime(-24) }
      ]
    },
    {
      id: "WP-1037", title: "Clear stormwater channel", description: "Remove debris from stormwater channel behind the Main Street property and confirm unrestricted flow.",
      businessId: "b3", siteId: "s5", projectId: "p3", managerId: "u3", teamId: "t2", assigneeId: "u8", createdBy: "u3", priority: "high", status: "rejected", dueDate: isoDate(0), createdAt: isoTime(-66), startedAt: isoTime(-50), submittedAt: isoTime(-12), requiredEvidence: ["before", "after"], evidence: [
        { id: "e6", type: "after", note: "Channel cleared", image: placeholderImage("After · channel", "#374151", "#111827"), uploadedBy: "u8", uploadedAt: isoTime(-12) }
      ], rejectionReason: "The outlet section is still blocked. Clear the final five metres and upload another photograph.",
      timeline: [
        { type: "created", text: "Task created by Johan van Wyk", at: isoTime(-66) },
        { type: "started", text: "Work started by Elias Mabuza", at: isoTime(-50) },
        { type: "submitted", text: "Submitted for review", at: isoTime(-12) },
        { type: "rejected", text: "Rejected: outlet section remains blocked", at: isoTime(-10) }
      ]
    },
    {
      id: "WP-1036", title: "Weekly venue grounds inspection", description: "Inspect lawns, pathways, irrigation, outside lighting and guest entrance. Report defects as separate tasks.",
      businessId: "b2", siteId: "s4", projectId: "p2", managerId: "u2", teamId: "t2", assigneeId: "u7", createdBy: "u2", priority: "low", status: "assigned", dueDate: isoDate(2), createdAt: isoTime(-10), requiredEvidence: ["checklist", "after"], evidence: [], recurring: "weekly",
      timeline: [{ type: "created", text: "Recurring task generated automatically", at: isoTime(-10) }]
    },
    {
      id: "WP-1035", title: "Repair staff bathroom tap", description: "Replace leaking basin tap and inspect cabinet for water damage.",
      businessId: "b1", siteId: "s1", projectId: null, managerId: "u2", teamId: "t2", assigneeId: "u8", createdBy: "u2", priority: "medium", status: "approved", dueDate: isoDate(-4), createdAt: isoTime(-180), startedAt: isoTime(-160), submittedAt: isoTime(-146), completedAt: isoTime(-140), requiredEvidence: ["before", "after"], evidence: [
        { id: "e7", type: "before", note: "Leaking tap", image: placeholderImage("Before · tap", "#1e40af", "#172554"), uploadedBy: "u8", uploadedAt: isoTime(-160) },
        { id: "e8", type: "after", note: "New tap installed", image: placeholderImage("After · tap", "#047857", "#022c22"), uploadedBy: "u8", uploadedAt: isoTime(-146) }
      ],
      timeline: [
        { type: "created", text: "Task assigned", at: isoTime(-180) },
        { type: "started", text: "Work started", at: isoTime(-160) },
        { type: "submitted", text: "Submitted for review", at: isoTime(-146) },
        { type: "approved", text: "Approved by Pieter Botha", at: isoTime(-140) }
      ]
    },
    {
      id: "WP-1034", title: "Secure loose fence panel at vehicle yard", description: "Realign and secure the loose palisade panel at the rear vehicle yard. Confirm that the panel is stable and that no sharp edges remain exposed.",
      businessId: "b1", siteId: "s1", projectId: "p1", managerId: "u2", teamId: "t1", assigneeId: "u5", createdBy: "u2", priority: "high", status: "assigned", dueDate: isoDate(1), createdAt: isoTime(-8), requiredEvidence: ["before", "after"], evidence: [],
      timeline: [{ type: "created", text: "Task assigned to Sipho Dlamini", at: isoTime(-8) }]
    }
  ],
  notifications: [
    { id: "n1", title: "Roof repair awaiting approval", text: "Sipho submitted three photos for WP-1042.", at: isoTime(-2), read: false, taskId: "WP-1042" },
    { id: "n2", title: "Task overdue", text: "Outside light replacement is two days overdue.", at: isoTime(-7), read: false, taskId: "WP-1039" },
    { id: "n3", title: "Rework requested", text: "Stormwater channel task was returned to the team.", at: isoTime(-10), read: false, taskId: "WP-1037" }
  ]
};

let data = emptyWorkspace();
function safeSessionGet(key) { try { return sessionStorage.getItem(key); } catch { return null; } }
function safeSessionSet(key, value) { try { sessionStorage.setItem(key, value); } catch {} }
function safeSessionRemove(key) { try { sessionStorage.removeItem(key); } catch {} }

let state = {
  userId: null,
  page: "dashboard",
  taskSearch: "",
  statusFilter: "all",
  siteFilter: "all"
};

const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const pageContent = document.getElementById("page-content");
const modalRoot = document.getElementById("modal-root");
const rememberedAccountsKey = "workproof-remembered-accounts";

function rememberedAccounts() {
  try {
    const value = JSON.parse(localStorage.getItem(rememberedAccountsKey) || "[]");
    return Array.isArray(value) ? value.filter((account) => account?.username && account?.name) : [];
  } catch { return []; }
}

function rememberAccount(user) {
  if (!user?.username || !user?.name) return;
  const accounts = rememberedAccounts().filter((account) => account.username !== user.username);
  accounts.unshift({ username: user.username, name: user.name });
  try { localStorage.setItem(rememberedAccountsKey, JSON.stringify(accounts.slice(0, 12))); } catch {}
  renderLoginAccounts(user.username);
}

function renderLoginAccounts(selected = "") {
  const select = document.getElementById("login-account");
  if (!select) return;
  const accounts = rememberedAccounts();
  select.innerHTML = `<option value="">Select your name</option>${accounts.map((account) => `<option value="${escapeHtml(account.username)}">${escapeHtml(account.name)}</option>`).join("")}<option value="__other__">First time on this device</option>`;
  select.value = accounts.some((account) => account.username === selected) ? selected : "";
  updateLoginFields();
}

function updateLoginFields() {
  const choice = document.getElementById("login-account")?.value || "";
  const identifierGroup = document.getElementById("login-identifier-group");
  const passwordGroup = document.getElementById("login-password-group");
  const identifier = document.getElementById("login-identifier");
  identifierGroup?.classList.toggle("hidden", choice !== "__other__");
  passwordGroup?.classList.toggle("hidden", !choice);
  if (identifier) {
    identifier.required = choice === "__other__";
    if (choice !== "__other__") identifier.value = choice;
  }
  if (choice) setTimeout(() => (choice === "__other__" ? identifier : document.getElementById("login-password"))?.focus(), 0);
}

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedData));
}

function emptyWorkspace() {
  return { workspace: { name: "WorkProof", pilot: false }, businesses: [], sites: [], users: [], teams: [], projects: [], tasks: [], notifications: [] };
}

function saveData() {
  // UI state is refreshed from Supabase after every production mutation.
}

async function invokeSecureFunction(name, body) {
  const { data: result, error } = await supabase.functions.invoke(name, { body });
  if (!error && !result?.error) return result;
  let message = result?.error || error?.message || "The request could not be completed.";
  try {
    if (error?.context instanceof Response) {
      const details = await error.context.clone().json();
      message = details?.error || details?.message || message;
    }
  } catch {
    // Keep the standard message when the function did not return JSON.
  }
  throw new Error(message);
}

const dbToUiStatus = (status) => ({ in_progress: "in-progress", awaiting_review: "awaiting-review", rework: "rejected", closed: "completed" })[status] || status;
const uiToDbStatus = (status) => ({ "in-progress": "in_progress", "awaiting-review": "awaiting_review", rejected: "rework", completed: "closed", overdue: "assigned" })[status] || status;
const dbToUiRole = (role) => role === "team_lead" ? "lead" : role;
const uiToDbRole = (role) => role === "lead" ? "team_lead" : role;
const requirementList = (value) => value === "before_after" ? ["before", "after"] : value === "none" ? [] : ["after"];

async function loadBackendData() {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) throw new Error("Your session has expired. Please sign in again.");
  state.userId = session.user.id;
  const uid = session.user.id;
  const { data: membership, error: membershipError } = await supabase.from("organisation_members").select("organisation_id,role,organisations(name)").eq("user_id", uid).eq("active", true).limit(1).single();
  if (membershipError) throw membershipError;
  const org = membership.organisation_id;
  const [businesses, sites, teams, teamMembers, projects, tasks, evidence, events, members] = await Promise.all([
    supabase.from("businesses").select("*").eq("organisation_id", org).order("name"),
    supabase.from("sites").select("*").eq("organisation_id", org).order("name"),
    supabase.from("teams").select("*").eq("organisation_id", org).order("name"),
    supabase.from("team_members").select("*").eq("organisation_id", org),
    supabase.from("projects").select("*").eq("organisation_id", org).order("created_at"),
    supabase.from("tasks").select("*").eq("organisation_id", org).order("created_at", { ascending: false }),
    supabase.from("task_evidence").select("*").eq("organisation_id", org).order("created_at"),
    supabase.from("task_events").select("*").eq("organisation_id", org).order("created_at"),
    supabase.from("organisation_members").select("user_id,role,active,profiles(*)").eq("organisation_id", org)
  ]);
  for (const result of [businesses, sites, teams, teamMembers, projects, tasks, evidence, events, members]) if (result.error) throw result.error;
  const signedEvidence = await Promise.all((evidence.data || []).map(async (item) => {
    const signed = await supabase.storage.from("task-evidence").createSignedUrl(item.storage_path, 3600);
    return { ...item, signedUrl: signed.data?.signedUrl || "" };
  }));
  const teamForUser = new Map((teamMembers.data || []).map((item) => [item.user_id, item.team_id]));
  const memberRows = members.data || [];
  data = {
    workspace: { name: membership.organisations?.name || "Albert Operations", pilot: false, organisationId: org },
    businesses: (businesses.data || []).map((item) => ({ id: item.id, name: item.name, code: item.code || item.name.slice(0, 4).toUpperCase(), type: item.business_type || "Business" })),
    sites: (sites.data || []).map((item) => ({ id: item.id, businessId: item.business_id, name: item.name, location: item.address || "", managerId: item.manager_id || null })),
    users: memberRows.map((item) => ({ id: item.user_id, name: item.profiles?.full_name || item.profiles?.username || "Unnamed user", username: item.profiles?.username || "", role: dbToUiRole(item.role), title: item.profiles?.title || roleLabel(dbToUiRole(item.role)), initials: initials(item.profiles?.full_name || item.profiles?.username), phone: item.profiles?.phone || "", teamId: teamForUser.get(item.user_id) || null, active: item.active && item.profiles?.active !== false })),
    teams: (teams.data || []).map((item) => { const tm=(teamMembers.data || []).filter((x)=>x.team_id===item.id); return { id:item.id,name:item.name,managerId:item.manager_id||null,leadId:tm.find((x)=>x.is_lead)?.user_id||null,memberIds:tm.map((x)=>x.user_id),trade:item.trade||item.description||"Operations" }; }),
    projects: (projects.data || []).map((item) => ({ id:item.id,name:item.name,businessId:item.business_id||null,siteId:item.site_id,managerId:item.manager_id||null,status:item.active?"active":"closed",startDate:item.start_date?.slice(0,10),endDate:item.end_date?.slice(0,10),budget:Number(item.budget||0) })),
    tasks: (tasks.data || []).map((item) => ({ id:item.id,taskNumber:item.task_number,title:item.title,description:item.description,businessId:(sites.data || []).find((s)=>s.id===item.site_id)?.business_id||null,siteId:item.site_id,projectId:item.project_id,managerId:item.manager_id,teamId:item.team_id,assigneeId:item.assignee_id,createdBy:item.created_by,priority:item.priority==="normal"?"medium":item.priority,status:dbToUiStatus(item.status),dueDate:item.due_at?.slice(0,10),createdAt:item.created_at,startedAt:item.started_at,submittedAt:item.submitted_at,completedAt:item.approved_at,requiredEvidence:requirementList(item.evidence_requirement),rejectionReason:item.rework_reason,evidence:signedEvidence.filter((e)=>e.task_id===item.id).map((e)=>({id:e.id,type:e.evidence_type,note:e.note||"",image:e.signedUrl,uploadedBy:e.uploaded_by,uploadedAt:e.created_at,storagePath:e.storage_path})),timeline:(events.data||[]).filter((e)=>e.task_id===item.id).map((e)=>({type:e.to_status?dbToUiStatus(e.to_status):e.event_type,text:e.note||`Status changed to ${statusLabel(dbToUiStatus(e.to_status||item.status))}`,at:e.created_at})) })),
    notifications: []
  };
  if (["owner","manager"].includes(dbToUiRole(membership.role))) {
    const snapshots = await Promise.all(["daily","weekly","monthly"].map((period)=>supabase.rpc("reporting_snapshot",{p_period:period})));
    data.reportSnapshots = Object.fromEntries(["daily","weekly","monthly"].map((period,index)=>[period,snapshots[index].data||null]));
  }
  const me = data.users.find((user) => user.id === uid);
  if (me) {
    me.role = dbToUiRole(membership.role);
    rememberAccount(me);
  }
}

async function refreshBackend(message) {
  await loadBackendData();
  renderPage();
  if (message) toast(message);
}

function currentUser() {
  return data.users.find((u) => u.id === state.userId) || null;
}

function getUser(id) { return data.users.find((u) => u.id === id); }
function getTeam(id) { return data.teams.find((t) => t.id === id); }
function getSite(id) { return data.sites.find((s) => s.id === id); }
function getBusiness(id) { return data.businesses.find((b) => b.id === id); }
function getProject(id) { return data.projects.find((p) => p.id === id); }

function formatDate(value, options = {}) {
  if (!value) return "Not set";
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(d.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: options.short ? "short" : "long",
    year: options.year === false ? undefined : "numeric"
  }).format(d);
}

function timeAgo(value) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${mins || 1}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isOverdue(task) {
  return !["approved", "completed"].includes(task.status) && task.dueDate < isoDate(0);
}

function normalizedStatus(task) {
  if (isOverdue(task) && !["awaiting-review", "rejected", "blocked"].includes(task.status)) return "overdue";
  return task.status;
}

function statusLabel(status) {
  return ({
    draft: "Draft",
    assigned: "Assigned",
    "in-progress": "In progress",
    blocked: "Blocked",
    "awaiting-review": "Awaiting review",
    approved: "Approved",
    completed: "Completed",
    rejected: "Rework required",
    overdue: "Overdue"
  })[status] || status;
}

function roleLabel(role) {
  return ({ owner: "Owner", manager: "Construction Manager", lead: "Team Leader", worker: "Worker" })[role] || role;
}

function initials(name = "") {
  return name.split(/\s+/).slice(0, 2).map((v) => v[0]).join("").toUpperCase();
}

function uid() {
  return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[c]);
}

function visibleTasks() {
  const user = currentUser();
  if (!user) return [];
  if (user.role === "owner") return [...data.tasks];
  if (user.role === "manager") return data.tasks.filter((t) => t.managerId === user.id || t.createdBy === user.id);
  if (user.role === "lead") return data.tasks.filter((t) => t.teamId === user.teamId || t.assigneeId === user.id);
  return data.tasks.filter((t) => t.assigneeId === user.id || t.teamId === user.teamId);
}

function canCreateTask() {
  return ["owner", "manager"].includes(currentUser()?.role);
}

function canReviewTask(task) {
  const user = currentUser();
  return user && ["owner", "manager"].includes(user.role) && (user.role === "owner" || task.managerId === user.id);
}

function canDeleteTask(task) {
  const user = currentUser();
  return Boolean(user && (user.role === "owner" || (user.role === "manager" && task.createdBy === user.id)));
}

function canWorkTask(task) {
  const user = currentUser();
  if (!user) return false;
  if (user.role === "owner" || user.role === "manager") return false;
  return task.assigneeId === user.id || task.teamId === user.teamId;
}

function taskLabel(task) {
  return `Task ${task.taskNumber || "Not set"}`;
}

function updateDerivedOverdueStatuses() {
  data.tasks.forEach((task) => {
    if (task.status === "overdue" && task.dueDate >= isoDate(0)) task.status = "assigned";
  });
}

function toast(message, type = "success") {
  const root = document.getElementById("toast-root");
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.innerHTML = `${type === "danger" ? icons.warning : icons.check}<span>${escapeHtml(message)}</span>`;
  root.appendChild(item);
  setTimeout(() => item.remove(), 3600);
}

function setPage(page) {
  state.page = page;
  document.querySelectorAll(".nav-item[data-page], .bottom-nav-item[data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });
  document.querySelector(".sidebar")?.classList.remove("open");
  renderPage();
}

function updateShell() {
  const user = currentUser();
  if (!user) return;
  document.getElementById("sidebar-name").textContent = user.name;
  document.getElementById("sidebar-role").textContent = roleLabel(user.role);
  document.getElementById("sidebar-avatar").textContent = user.initials || initials(user.name);
  document.getElementById("nav-task-count").textContent = visibleTasks().filter((t) => !["approved", "completed"].includes(t.status)).length;
  document.getElementById("create-task-btn").style.display = canCreateTask() ? "inline-flex" : "none";
  document.getElementById("bottom-create-task").title = canCreateTask() ? "Create task" : "Upload proof";

  const unread = data.notifications.filter((n) => !n.read).length;
  const badge = document.querySelector(".notification-badge");
  badge.textContent = unread;
  badge.style.display = unread ? "grid" : "none";
}

function showApp() {
  updateDerivedOverdueStatuses();
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  updateShell();
  injectIcons();
  renderPage();
}

function showLogin() {
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
  renderLoginAccounts();
}

function renderPage() {
  updateShell();
  const pageMeta = {
    dashboard: ["OPERATIONS OVERVIEW", "Dashboard"],
    tasks: ["EXECUTION CONTROL", "Tasks"],
    projects: ["ACTIVE WORKSTREAMS", "Projects"],
    sites: ["BUSINESS LOCATIONS", "Sites & properties"],
    teams: ["WORKFORCE", "Teams"],
    reports: ["PERFORMANCE", "Reports"],
    settings: ["WORKSPACE", "Settings"]
  };
  const [eyebrow, title] = pageMeta[state.page] || pageMeta.dashboard;
  document.getElementById("page-eyebrow").textContent = eyebrow;
  document.getElementById("page-title").textContent = title;

  const renderers = {
    dashboard: renderDashboard,
    tasks: renderTasks,
    projects: renderProjects,
    sites: renderSites,
    teams: renderTeams,
    reports: renderReports,
    settings: renderSettings
  };
  pageContent.innerHTML = (renderers[state.page] || renderDashboard)();
  injectIcons(pageContent);
  bindPageEvents();
}

function renderDashboard() {
  const user = currentUser();
  const tasks = visibleTasks();
  const open = tasks.filter((t) => !["approved", "completed"].includes(t.status)).length;
  const overdue = tasks.filter(isOverdue).length;
  const review = tasks.filter((t) => t.status === "awaiting-review").length;
  const completed = tasks.filter((t) => ["approved", "completed"].includes(t.status)).length;
  const totalForRate = Math.max(tasks.length, 1);
  const completionRate = Math.round((completed / totalForRate) * 100);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  const priorityTasks = tasks
    .filter((t) => !["approved", "completed"].includes(t.status))
    .sort((a, b) => (isOverdue(b) - isOverdue(a)) || a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const reviewTasks = tasks.filter((t) => t.status === "awaiting-review").slice(0, 4);
  const activities = allActivityForUser().slice(0, 6);

  return `
    <div class="stack">
      <section class="hero-panel">
        <div class="hero-copy">
          <div class="eyebrow light">${escapeHtml(roleLabel(user.role).toUpperCase())} WORKSPACE</div>
          <h2>${greeting}, ${escapeHtml(user.name.split(" ")[0])}.</h2>
          <p>${dashboardMessage(user, overdue, review)}</p>
        </div>
        <div class="hero-actions">
          ${canCreateTask() ? `<button class="btn btn-accent js-create-task">${icons.plus} Assign new work</button>` : `<button class="btn btn-accent js-open-my-task">${icons.tasks} Open my next task</button>`}
          <button class="btn btn-secondary js-view-reports">${icons.reports} View performance</button>
        </div>
      </section>

      <section class="grid grid-4">
        ${metricCard("Open work", open, "tasks", "info", `${tasks.filter((t) => t.status === "in-progress").length} currently in progress`)}
        ${metricCard("Overdue", overdue, "warning", "warning", overdue ? "Needs intervention today" : "No overdue work")}
        ${metricCard("Awaiting review", review, "eye", "warning", review ? "Proof ready for approval" : "Nothing waiting")}
        ${metricCard("Completed", completed, "check", "success", `${completionRate}% of visible tasks`)}
      </section>

      <section class="grid grid-3">
        <div class="card span-2">
          <div class="card-header">
            <div><h3>Priority work</h3><p>Tasks requiring attention across the operation.</p></div>
            <button class="btn btn-ghost btn-sm js-all-tasks">View all ${icons.arrow}</button>
          </div>
          <div class="task-list">
            ${priorityTasks.length ? priorityTasks.map(compactTask).join("") : emptyInline("No open priority tasks")}
          </div>
        </div>
        <div class="card card-pad">
          <div class="row-between">
            <div><h3 class="section-title mb-0">Execution rate</h3><p class="muted small">Current visible workload</p></div>
          </div>
          <div class="row" style="justify-content:center; padding: 24px 0 16px;">
            <div class="progress-ring" style="--progress:${completionRate}"><div class="progress-ring-label"><strong>${completionRate}%</strong><span>completed</span></div></div>
          </div>
          <div class="kpi-row"><strong>Approved</strong><div class="mini-progress"><span style="width:${completionRate}%"></span></div><span class="small">${completed}</span></div>
          <div class="kpi-row"><strong>In progress</strong><div class="mini-progress"><span style="width:${Math.round(tasks.filter(t => t.status === 'in-progress').length / totalForRate * 100)}%"></span></div><span class="small">${tasks.filter(t => t.status === 'in-progress').length}</span></div>
          <div class="kpi-row"><strong>Rework</strong><div class="mini-progress"><span style="width:${Math.round(tasks.filter(t => t.status === 'rejected').length / totalForRate * 100)}%"></span></div><span class="small">${tasks.filter(t => t.status === 'rejected').length}</span></div>
        </div>
      </section>

      <section class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <div><h3>${canReviewAny() ? "Waiting for approval" : "Recent task updates"}</h3><p>${canReviewAny() ? "Submitted work requiring manager review." : "Latest movement on work assigned to the team."}</p></div>
          </div>
          <div class="task-list">
            ${(canReviewAny() ? reviewTasks : priorityTasks.slice(0, 4)).length ? (canReviewAny() ? reviewTasks : priorityTasks.slice(0, 4)).map(compactTask).join("") : emptyInline("Nothing is waiting for review")}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div><h3>Recent activity</h3><p>Audit trail across tasks and teams.</p></div></div>
          <div class="activity-list">
            ${activities.length ? activities.map(activityItem).join("") : emptyInline("No recent activity")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function dashboardMessage(user, overdue, review) {
  if (user.role === "owner") return `There are ${overdue} overdue task${overdue === 1 ? "" : "s"} and ${review} submission${review === 1 ? "" : "s"} awaiting approval across the group.`;
  if (user.role === "manager") return `Your teams have ${overdue} overdue task${overdue === 1 ? "" : "s"} and ${review} submission${review === 1 ? "" : "s"} waiting for review.`;
  if (user.role === "lead") return `Coordinate the team, upload proof and escalate anything blocking execution.`;
  return `Your assigned work is listed below. Upload the required proof before submitting a task.`;
}

function metricCard(label, value, icon, tone, foot) {
  return `<div class="card metric-card"><div class="metric-head"><span>${label}</span><span class="metric-icon ${tone}">${icons[icon]}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${escapeHtml(foot)}</div></div>`;
}

function compactTask(task) {
  const status = normalizedStatus(task);
  const assignee = getUser(task.assigneeId);
  const site = getSite(task.siteId);
  return `<button class="compact-task js-open-task" data-task-id="${task.id}" style="width:100%; background:transparent; border-left:0; border-right:0; border-bottom:0; text-align:left;">
    <div class="task-ref">${taskLabel(task)}</div>
    <div class="activity-copy"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(site?.name || "No site")} · Due ${formatDate(task.dueDate, { short: true, year: false })}</span></div>
    <div class="assignee"><div class="avatar ${avatarTone(assignee?.id)}">${assignee?.initials || "?"}</div><span class="badge ${status}">${statusLabel(status)}</span></div>
  </button>`;
}

function activityItem(activity) {
  return `<div class="activity-item"><span class="activity-dot ${activity.tone || ""}"></span><div class="activity-copy"><strong>${escapeHtml(activity.title)}</strong><span>${escapeHtml(activity.text)}</span></div><span class="activity-time">${timeAgo(activity.at)}</span></div>`;
}

function allActivityForUser() {
  const allowedIds = new Set(visibleTasks().map((t) => t.id));
  return data.tasks.flatMap((task) => (task.timeline || []).map((event) => ({
    taskId: task.id,
    title: task.title,
    text: event.text,
    at: event.at,
    tone: event.type === "approved" ? "success" : event.type === "rejected" ? "warning" : ""
  }))).filter((item) => allowedIds.has(item.taskId)).sort((a, b) => new Date(b.at) - new Date(a.at));
}

function canReviewAny() {
  return ["owner", "manager"].includes(currentUser()?.role);
}

function renderTasks() {
  const tasks = filteredTasks();
  const sites = visibleSites();
  return `
    <div class="toolbar">
      <div class="filter-group">
        <div class="search-box"><span data-icon="search"></span><input id="task-search" class="input" type="search" placeholder="Search tasks, sites or people" value="${escapeHtml(state.taskSearch)}" /></div>
        <select id="status-filter" class="input filter-select">
          ${["all", "assigned", "in-progress", "awaiting-review", "overdue", "rejected", "approved"].map((s) => `<option value="${s}" ${state.statusFilter === s ? "selected" : ""}>${s === "all" ? "All statuses" : statusLabel(s)}</option>`).join("")}
        </select>
        <select id="site-filter" class="input filter-select">
          <option value="all">All sites</option>
          ${sites.map((s) => `<option value="${s.id}" ${state.siteFilter === s.id ? "selected" : ""}>${escapeHtml(s.name)}</option>`).join("")}
        </select>
      </div>
      ${canCreateTask() ? `<button class="btn btn-primary js-create-task">${icons.plus} New task</button>` : ""}
    </div>

    <div class="card">
      ${tasks.length ? `
      <div class="desktop-table table-wrap">
        <table class="data-table">
          <thead><tr><th>Task</th><th>Status</th><th>Site</th><th>Assignee</th><th>Priority</th><th>Due date</th><th></th></tr></thead>
          <tbody>${tasks.map(taskRow).join("")}</tbody>
        </table>
      </div>
      <div class="mobile-task-list">${tasks.map(taskMobileCard).join("")}</div>
      ` : emptyState("tasks", "No tasks match the selected filters", "Clear the search or create a new task for the team.", canCreateTask() ? `<button class="btn btn-primary js-create-task">${icons.plus} Create task</button>` : "")}
    </div>
  `;
}

function filteredTasks() {
  const query = state.taskSearch.trim().toLowerCase();
  return visibleTasks().filter((task) => {
    const status = normalizedStatus(task);
    const haystack = [taskLabel(task), task.title, task.description, getSite(task.siteId)?.name, getBusiness(task.businessId)?.name, getUser(task.assigneeId)?.name, getTeam(task.teamId)?.name].filter(Boolean).join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (state.statusFilter === "all" || status === state.statusFilter) && (state.siteFilter === "all" || task.siteId === state.siteFilter);
  }).sort((a, b) => {
    const rank = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (isOverdue(b) - isOverdue(a)) || (rank[a.priority] - rank[b.priority]) || a.dueDate.localeCompare(b.dueDate);
  });
}

function taskRow(task) {
  const status = normalizedStatus(task);
  const assignee = getUser(task.assigneeId);
  const site = getSite(task.siteId);
  return `<tr>
    <td><div class="task-title-cell"><div class="task-ref">${taskLabel(task)}</div><div><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(getProject(task.projectId)?.name || "General maintenance")}</span></div></div></td>
    <td><span class="badge ${status}">${statusLabel(status)}</span></td>
    <td>${escapeHtml(site?.name || "Not set")}</td>
    <td><div class="assignee"><div class="avatar ${avatarTone(assignee?.id)}">${assignee?.initials || "?"}</div><span>${escapeHtml(assignee?.name || getTeam(task.teamId)?.name || "Unassigned")}</span></div></td>
    <td><span class="badge ${task.priority}">${escapeHtml(task.priority)}</span></td>
    <td><strong>${formatDate(task.dueDate, { short: true })}</strong>${isOverdue(task) ? `<div class="tiny" style="color:var(--danger); margin-top:3px;">Overdue</div>` : ""}</td>
    <td><div class="task-row-actions"><button class="icon-btn subtle js-open-task" data-task-id="${task.id}" aria-label="Open task">${icons.eye}</button></div></td>
  </tr>`;
}

function taskMobileCard(task) {
  const assignee = getUser(task.assigneeId);
  const status = normalizedStatus(task);
  return `<button class="task-card-mobile js-open-task" data-task-id="${task.id}" style="width:100%; background:white; border:0; text-align:left;">
    <div class="row-between"><span class="task-ref">${taskLabel(task)}</span><span class="badge ${status}">${statusLabel(status)}</span></div>
    <h3 style="font-size:15px; margin:12px 0 7px;">${escapeHtml(task.title)}</h3>
    <div class="muted small">${escapeHtml(getSite(task.siteId)?.name || "Not set")}</div>
    <div class="row-between mt-16"><div class="assignee"><div class="avatar ${avatarTone(assignee?.id)}">${assignee?.initials || "?"}</div><span class="small">${escapeHtml(assignee?.name || "Unassigned")}</span></div><strong class="small">${formatDate(task.dueDate, { short: true, year: false })}</strong></div>
  </button>`;
}

function renderProjects() {
  const projects = visibleProjects();
  return `<div class="grid grid-3">${projects.map((project) => {
    const tasks = visibleTasks().filter((t) => t.projectId === project.id);
    const completed = tasks.filter((t) => ["approved", "completed"].includes(t.status)).length;
    const completion = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    return `<div class="card entity-card">
      <div class="row-between"><span class="entity-icon">${icons.projects}</span><span class="badge ${project.status === "active" ? "in-progress" : "approved"}">${project.status}</span></div>
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(getSite(project.siteId)?.name || "No site")} · Managed by ${escapeHtml(getUser(project.managerId)?.name || "Not set")}</p>
      <div class="mt-16"><div class="row-between small"><span class="muted">Completion</span><strong>${completion}%</strong></div><div class="mini-progress mt-16" style="margin-top:7px;"><span style="width:${completion}%"></span></div></div>
      <div class="entity-stats"><div><strong>${tasks.length}</strong><span>Tasks</span></div><div><strong>${tasks.filter(isOverdue).length}</strong><span>Overdue</span></div><div><strong>R${Math.round(project.budget / 1000)}k</strong><span>Budget</span></div></div>
    </div>`;
  }).join("")}</div>`;
}

function visibleProjects() {
  const user = currentUser();
  if (user.role === "owner") return data.projects;
  if (user.role === "manager") { const ids=new Set(visibleTasks().map((task)=>task.projectId)); return data.projects.filter((p) => p.managerId === user.id||ids.has(p.id)); }
  const siteIds = new Set(visibleTasks().map((t) => t.siteId));
  return data.projects.filter((p) => siteIds.has(p.siteId));
}

function visibleSites() {
  const user = currentUser();
  if (!user || user.role === "owner") return data.sites;
  if (user.role === "manager") { const ids=new Set(visibleTasks().map((task)=>task.siteId)); return data.sites.filter((s) => s.managerId === user.id||ids.has(s.id)); }
  const ids = new Set(visibleTasks().map((t) => t.siteId));
  return data.sites.filter((s) => ids.has(s.id));
}

function renderSites() {
  const sites = visibleSites();
  const addButton = currentUser()?.role === "owner" ? `<button class="btn btn-primary js-add-site">${icons.plus} Add site or property</button>` : "";
  return `<div class="stack">
    <div class="row-between page-heading-row"><div><h2 style="margin:0;font-size:22px;">Sites and properties</h2><p class="muted small">The operating locations connected to this workspace.</p></div>${addButton}</div>
    ${sites.length ? `<div class="grid grid-3">${sites.map((site) => {
    const tasks = visibleTasks().filter((t) => t.siteId === site.id);
    return `<div class="card entity-card">
      <div class="site-banner"><span>${icons.building}</span><span class="tiny">${escapeHtml(getBusiness(site.businessId)?.code || "SITE")}</span></div>
      <h3>${escapeHtml(site.name)}</h3>
      <p>${escapeHtml(site.location)}<br>${escapeHtml(getBusiness(site.businessId)?.name || "")}</p>
      <div class="entity-stats"><div><strong>${tasks.filter(t => !["approved","completed"].includes(t.status)).length}</strong><span>Open</span></div><div><strong>${tasks.filter(isOverdue).length}</strong><span>Overdue</span></div><div><strong>${tasks.filter(t => t.status === "awaiting-review").length}</strong><span>Review</span></div></div>
    </div>`;
  }).join("")}</div>` : emptyState("sites", "No sites yet", "Add the first site or property to start assigning work.", addButton)}</div>`;
}

function visibleTeams() {
  const user = currentUser();
  if (user.role === "owner") return data.teams;
  if (user.role === "manager") { const ids=new Set(visibleTasks().map((task)=>task.teamId)); return data.teams.filter((t) => t.managerId === user.id||ids.has(t.id)); }
  return data.teams.filter((t) => t.id === user.teamId);
}

function renderTeams() {
  const teams = visibleTeams();
  return `<div class="grid grid-3">${teams.map((team) => {
    const members = team.memberIds.map(getUser).filter(Boolean);
    const tasks = visibleTasks().filter((t) => t.teamId === team.id);
    const completion = tasks.length ? Math.round(tasks.filter((t) => ["approved", "completed"].includes(t.status)).length / tasks.length * 100) : 0;
    return `<div class="card entity-card">
      <div class="row-between"><span class="entity-icon">${icons.teams}</span><span class="badge ${tasks.filter(isOverdue).length ? "overdue" : "approved"}">${tasks.filter(isOverdue).length ? `${tasks.filter(isOverdue).length} overdue` : "On track"}</span></div>
      <h3>${escapeHtml(team.name)}</h3><p>${escapeHtml(team.trade)} · Manager: ${escapeHtml(getUser(team.managerId)?.name || "Not set")}</p>
      <div class="team-member-stack">${members.map((m, i) => `<div class="avatar ${["orange","green","blue","purple"][i % 4]}" title="${escapeHtml(m.name)}">${m.initials}</div>`).join("")}</div>
      <div class="entity-stats"><div><strong>${members.length}</strong><span>Members</span></div><div><strong>${tasks.filter(t => !["approved","completed"].includes(t.status)).length}</strong><span>Open tasks</span></div><div><strong>${completion}%</strong><span>Completed</span></div></div>
    </div>`;
  }).join("")}</div>`;
}

function renderReports() {
  const tasks = visibleTasks();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { label: new Intl.DateTimeFormat("en-ZA", { weekday: "short" }).format(d), count: tasks.filter((t) => t.completedAt?.slice(0, 10) === key || (t.status === "approved" && t.timeline?.some((e) => e.type === "approved" && e.at.slice(0, 10) === key))).length };
  });
  const max = Math.max(...last7.map((v) => v.count), 1);
  const teamRows = visibleTeams().map((team) => {
    const teamTasks = tasks.filter((t) => t.teamId === team.id);
    const complete = teamTasks.filter((t) => ["approved", "completed"].includes(t.status)).length;
    const rate = teamTasks.length ? Math.round(complete / teamTasks.length * 100) : 0;
    return { team, rate, complete, total: teamTasks.length, rework: teamTasks.filter((t) => t.status === "rejected").length };
  });
  const approved = tasks.filter((t) => ["approved", "completed"].includes(t.status)).length;
  const rework = tasks.filter((t) => t.status === "rejected").length;
  const approvalTime = 6.4;
  const snapshots = data.reportSnapshots || {};
  const periodCards = ["daily","weekly","monthly"].map((period)=>{const s=snapshots[period]||{};return `<div class="detail-section"><span class="eyebrow">${period.toUpperCase()} REPORT</span><h3 style="margin:9px 0 12px;text-transform:capitalize;">${period} operations</h3><div class="detail-meta"><div class="meta-item"><span>Open</span><strong>${s.open_tasks??0}</strong></div><div class="meta-item"><span>Overdue</span><strong>${s.overdue_tasks??0}</strong></div><div class="meta-item"><span>Review</span><strong>${s.awaiting_review??0}</strong></div><div class="meta-item"><span>Approved</span><strong>${s.approved_in_period??0}</strong></div></div></div>`}).join("");
  const managerRows=(snapshots.monthly?.managers||[]).map((m)=>`<tr><td><strong>${escapeHtml(m.full_name)}</strong></td><td>${m.open_tasks}</td><td>${m.overdue_tasks}</td><td>${m.awaiting_review}</td><td>${m.approved_in_period}</td></tr>`).join("");
  return `<div class="stack">
    <div class="row-between"><div><h2 style="margin:0; font-size:22px;">Operational performance</h2><p class="muted small">Live daily, weekly and monthly management reporting.</p></div><button class="btn btn-secondary js-export-report">${icons.download} Export CSV</button></div>
    <div class="grid grid-3">${periodCards}</div>
    ${currentUser().role==="owner"&&managerRows?`<div class="card"><div class="card-header"><div><h3>Manager KPI scorecard</h3><p>Monthly open work, exceptions, reviews and approved output.</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Manager</th><th>Open</th><th>Overdue</th><th>Awaiting review</th><th>Approved</th></tr></thead><tbody>${managerRows}</tbody></table></div></div>`:""}
    <div class="grid grid-4">
      ${metricCard("Completion rate", tasks.length ? `${Math.round(approved/tasks.length*100)}%` : "0%", "check", "success", `${approved} tasks approved`)}
      ${metricCard("Rework rate", tasks.length ? `${Math.round(rework/tasks.length*100)}%` : "0%", "reset", rework ? "warning" : "success", `${rework} task${rework===1?"":"s"} returned`)}
      ${metricCard("Avg. approval time", `${approvalTime}h`, "clock", "info", "Submission to approval")}
      ${metricCard("Evidence coverage", `${evidenceCoverage(tasks)}%`, "camera", "success", "Required proof uploaded")}
    </div>
    <div class="grid grid-2">
      <div class="card"><div class="card-header"><div><h3>Tasks completed</h3><p>Approved work during the last seven days.</p></div></div><div class="card-body"><div class="bar-chart">${last7.map((v) => `<div class="bar-column"><div class="bar" style="height:${Math.max(8, v.count/max*100)}%"><span class="bar-value">${v.count}</span></div><small>${v.label}</small></div>`).join("")}</div></div></div>
      <div class="card"><div class="card-header"><div><h3>Team performance</h3><p>Completion and rework by operating team.</p></div></div><div class="card-body">${teamRows.map((r) => `<div class="kpi-row"><strong>${escapeHtml(r.team.name)}</strong><div class="mini-progress"><span style="width:${r.rate}%"></span></div><span class="small">${r.rate}%</span></div>`).join("")}</div></div>
    </div>
    <div class="card"><div class="card-header"><div><h3>Management attention</h3><p>Issues that should be discussed in the next operations review.</p></div></div><div class="card-body grid grid-3">
      <div class="detail-section"><span class="eyebrow">OVERDUE</span><h2 style="margin:8px 0 6px;">${tasks.filter(isOverdue).length}</h2><p class="muted small">Open tasks beyond their due date.</p></div>
      <div class="detail-section"><span class="eyebrow">REVIEW QUEUE</span><h2 style="margin:8px 0 6px;">${tasks.filter(t=>t.status==='awaiting-review').length}</h2><p class="muted small">Completed work waiting for sign-off.</p></div>
      <div class="detail-section"><span class="eyebrow">BLOCKED / REWORK</span><h2 style="margin:8px 0 6px;">${tasks.filter(t=>['blocked','rejected'].includes(t.status)).length}</h2><p class="muted small">Tasks requiring intervention or correction.</p></div>
    </div></div>
  </div>`;
}

function evidenceCoverage(tasks) {
  let required = 0;
  let supplied = 0;
  tasks.forEach((task) => {
    required += (task.requiredEvidence || []).length;
    const types = new Set((task.evidence || []).map((e) => e.type));
    supplied += (task.requiredEvidence || []).filter((type) => types.has(type)).length;
  });
  return required ? Math.round(supplied / required * 100) : 100;
}

function renderSettings() {
  const user = currentUser();
  const managedTeamIds=new Set(visibleTeams().map((team)=>team.id));
  const users = user.role === "owner" ? data.users : data.users.filter((u) => u.id === user.id || managedTeamIds.has(u.teamId));
  return `<div class="grid grid-2">
    <div class="card card-pad">
      <div class="row-between"><div><div class="eyebrow">WORKSPACE</div><h2 style="margin:8px 0 6px;">${escapeHtml(data.workspace.name)}</h2><p class="muted small">Founding-client pilot environment</p></div><span class="entity-icon">${icons.briefcase}</span></div>
      <div class="detail-meta mt-24"><div class="meta-item"><span>Businesses</span><strong>${data.businesses.length}</strong></div><div class="meta-item"><span>Sites</span><strong>${data.sites.length}</strong></div><div class="meta-item"><span>Users</span><strong>${data.users.filter(u=>u.active).length}</strong></div><div class="meta-item"><span>Tasks</span><strong>${data.tasks.length}</strong></div></div>
      <div class="row mt-24"><span class="badge approved">Live production workspace</span></div>
    </div>
    <div class="card card-pad"><div class="row-between"><div><div class="eyebrow">SECURITY MODEL</div><h3>Role-based access</h3></div><span class="entity-icon">${icons.shield}</span></div><p class="muted small" style="line-height:1.7;">Secure username, cellphone or email sign-in with database-enforced owner, manager, team-leader and worker permissions. Evidence is stored privately and revoked users immediately lose workspace access.</p></div>
    <div class="card span-2"><div class="card-header"><div><h3>People and access</h3><p>Current users visible in this workspace.</p></div>${["owner","manager"].includes(user.role) ? `<button class="btn btn-secondary btn-sm js-add-user">${icons.users} Add user</button>` : ""}</div><div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Team</th><th>Phone</th><th>Status</th><th></th></tr></thead><tbody>${users.map((u) => `<tr><td><div class="assignee"><div class="avatar ${avatarTone(u.id)}">${u.initials}</div><strong>${escapeHtml(u.name)}</strong></div></td><td>${escapeHtml(u.username||"Not set")}</td><td>${escapeHtml(roleLabel(u.role))}</td><td>${escapeHtml(getTeam(u.teamId)?.name || "Group level")}</td><td>${escapeHtml(u.phone||"Not set")}</td><td><span class="badge ${u.active ? "approved" : "draft"}">${u.active ? "Active" : "Revoked"}</span></td><td>${u.id!==user.id && (user.role==="owner"||["lead","worker"].includes(u.role))?`<button class="btn btn-ghost btn-sm js-toggle-user" data-user-id="${u.id}" data-active="${u.active}">${u.active?"Revoke":"Reactivate"}</button>`:""}</td></tr>`).join("")}</tbody></table></div></div>
  </div>`;
}

function bindPageEvents() {
  document.querySelectorAll(".js-create-task").forEach((b) => b.addEventListener("click", showCreateTaskModal));
  document.querySelectorAll(".js-open-task").forEach((b) => b.addEventListener("click", () => showTaskDetail(b.dataset.taskId)));
  document.querySelectorAll(".js-all-tasks").forEach((b) => b.addEventListener("click", () => setPage("tasks")));
  document.querySelectorAll(".js-view-reports").forEach((b) => b.addEventListener("click", () => setPage("reports")));
  document.querySelectorAll(".js-open-my-task").forEach((b) => b.addEventListener("click", () => {
    const task = visibleTasks().find((t) => !["approved", "completed"].includes(t.status));
    task ? showTaskDetail(task.id) : toast("No open tasks assigned to you.");
  }));
  document.getElementById("task-search")?.addEventListener("input", (e) => { state.taskSearch = e.target.value; renderPage(); });
  document.getElementById("status-filter")?.addEventListener("change", (e) => { state.statusFilter = e.target.value; renderPage(); });
  document.getElementById("site-filter")?.addEventListener("change", (e) => { state.siteFilter = e.target.value; renderPage(); });
  document.querySelector(".js-export-report")?.addEventListener("click", exportReportCsv);
  document.querySelector(".js-reset-demo")?.addEventListener("click", showResetModal);
  document.querySelector(".js-add-user")?.addEventListener("click", showAddUserModal);
  document.querySelectorAll(".js-add-site").forEach((button) => button.addEventListener("click", showAddSiteModal));
  document.querySelectorAll(".js-toggle-user").forEach((button)=>button.addEventListener("click",async()=>{
    const active=button.dataset.active==="true"; let password=null;
    if(!active){password=prompt("Set a new temporary password (minimum 8 characters)");if(!password)return;}
    if(active&&!confirm("Revoke this user's access immediately?"))return;
    try {
      await invokeSecureFunction("workproof-user-admin", { action:active?"revoke":"reactivate", user_id:button.dataset.userId, password });
      await refreshBackend(active?"User access revoked.":"User reactivated.");
    } catch (error) { toast(error.message, "danger"); }
  }));
}

function showAddSiteModal() {
  if (currentUser()?.role !== "owner") return toast("Only owners can add sites or properties.", "danger");
  openModal(`<div class="modal-header"><div><div class="eyebrow">OPERATING LOCATION</div><h2>Add a site or property</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><form id="add-site-form"><div class="modal-body"><div class="form-grid"><div class="form-group full"><label>Site or property name</label><input class="input" name="name" required maxlength="120" placeholder="Example: AutoCity Heidelberg"></div><div class="form-group"><label>Business</label><select class="input" name="businessId" required><option value="">Select a business</option>${data.businesses.map((business)=>`<option value="${business.id}">${escapeHtml(business.name)}</option>`).join("")}</select></div><div class="form-group"><label>Manager (optional)</label><select class="input" name="managerId"><option value="">No manager yet</option>${data.users.filter((user)=>user.role==="manager"&&user.active).map((manager)=>`<option value="${manager.id}">${escapeHtml(manager.name)}</option>`).join("")}</select></div><div class="form-group full"><label>Address or area</label><input class="input" name="address" maxlength="240" placeholder="Example: Heidelberg, Gauteng"></div></div><p class="form-hint" style="margin-top:14px;">Sites remain in the audit history and cannot be deleted from WorkProof.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-primary">Add site</button></div></form>`);
  document.getElementById("add-site-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submit = event.currentTarget.querySelector("button[type=submit]");
    submit.disabled = true;
    submit.textContent = "Adding site...";
    const { error } = await supabase.from("sites").insert({ organisation_id:data.workspace.organisationId, business_id:form.get("businessId"), name:form.get("name").trim(), address:form.get("address").trim()||null, manager_id:form.get("managerId")||null });
    if (error) { submit.disabled=false; submit.textContent="Add site"; return toast(error.message,"danger"); }
    closeModal();
    await refreshBackend("Site added successfully.");
  });
}

function avatarTone(id = "") {
  const tones = ["orange", "green", "blue", "purple"];
  const n = [...id].reduce((s, c) => s + c.charCodeAt(0), 0);
  return tones[n % tones.length];
}

function emptyInline(text) {
  return `<div class="empty-state" style="padding:36px 20px;"><p>${escapeHtml(text)}</p></div>`;
}

function emptyState(icon, title, text, action = "") {
  return `<div class="empty-state"><div class="entity-icon">${icons[icon] || icons.tasks}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p>${action}</div>`;
}

function showCreateTaskModal() {
  if (!canCreateTask()) return toast("Only owners, managers and team leaders can create work.", "danger");
  const user = currentUser();
  const businesses = user.role === "owner" ? data.businesses : data.businesses.filter((b) => visibleSites().some((s) => s.businessId === b.id));
  const sites = visibleSites();
  const teams = visibleTeams();
  const assignees = data.users.filter((u) => ["lead", "worker"].includes(u.role) && u.active && (user.role === "owner" || teams.some((t) => t.id === u.teamId)));
  const managers = data.users.filter((u) => u.role === "manager" && u.active);

  openModal(`
    <div class="modal-header"><div><div class="eyebrow">NEW WORK ITEM</div><h2>Assign a task</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div>
    <form id="create-task-form">
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group full"><label>Task title</label><input class="input" name="title" required maxlength="120" placeholder="Example: Repair damaged paving at entrance" /></div>
          <div class="form-group full"><label>Instructions</label><textarea class="input" name="description" required placeholder="Describe the expected result, standards and any safety requirements."></textarea></div>
          <div class="form-group"><label>Business</label><select class="input" name="businessId" id="new-business" required>${businesses.map((b) => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join("")}</select></div>
          <div class="form-group"><label>Site or property</label><select class="input" name="siteId" id="new-site" required>${sites.map((s) => `<option value="${s.id}" data-business="${s.businessId}">${escapeHtml(s.name)}</option>`).join("")}</select></div>
          <div class="form-group"><label>Project</label><select class="input" name="projectId"><option value="">General maintenance</option>${visibleProjects().map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")}</select></div>
          <div class="form-group"><label>Responsible manager</label><select class="input" name="managerId" ${user.role === "manager" ? "disabled" : ""}>${managers.map((m) => `<option value="${m.id}" ${m.id === user.id ? "selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}</select>${user.role === "manager" ? `<input type="hidden" name="managerId" value="${user.id}">` : ""}</div>
          <div class="form-group"><label>Team</label><select class="input" name="teamId"><option value="">No team</option>${teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("")}</select></div>
          <div class="form-group"><label>Assign to person</label><select class="input" name="assigneeId"><option value="">Assign to team only</option>${assignees.map((a) => `<option value="${a.id}">${escapeHtml(a.name)} · ${escapeHtml(a.title)}</option>`).join("")}</select></div>
          <div class="form-group"><label>Priority</label><select class="input" name="priority"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
          <div class="form-group"><label>Due date</label><input class="input" name="dueDate" type="date" min="${isoDate(0)}" value="${isoDate(2)}" required /></div>
          <div class="form-group full"><label>Required proof</label><div class="check-grid">
            ${["before", "during", "after", "checklist", "document", "sign-off"].map((type) => `<label class="check-tile"><input type="checkbox" name="evidence" value="${type}" ${["before","after"].includes(type) ? "checked" : ""}><span>${escapeHtml(type.replace("-", " "))}</span></label>`).join("")}
          </div><span class="form-hint">Workers cannot submit the task until each selected proof type is supplied.</span></div>
        </div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-primary">${icons.plus} Assign task</button></div>
    </form>
  `);

  const businessSelect = document.getElementById("new-business");
  const siteSelect = document.getElementById("new-site");
  const updateSites = () => {
    const businessId = businessSelect.value;
    [...siteSelect.options].forEach((option) => option.hidden = option.dataset.business !== businessId);
    const first = [...siteSelect.options].find((option) => !option.hidden);
    if (first) siteSelect.value = first.value;
  };
  businessSelect.addEventListener("change", updateSites);
  updateSites();

  document.getElementById("create-task-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const task = {
      title: form.get("title").trim(),
      description: form.get("description").trim(),
      businessId: form.get("businessId"),
      siteId: form.get("siteId"),
      projectId: form.get("projectId") || null,
      managerId: form.get("managerId") || (user.role === "manager" ? user.id : getSite(form.get("siteId"))?.managerId),
      teamId: form.get("teamId") || getUser(form.get("assigneeId"))?.teamId || null,
      assigneeId: form.get("assigneeId") || null,
      createdBy: user.id,
      priority: form.get("priority"),
      status: "assigned",
      dueDate: form.get("dueDate"),
      createdAt: new Date().toISOString(),
      requiredEvidence: form.getAll("evidence"),
      evidence: [],
      timeline: [{ type: "created", text: `Task created by ${user.name}`, at: new Date().toISOString() }]
    };
    const required = task.requiredEvidence;
    const evidenceRequirement = required.includes("before") && required.includes("after") ? "before_after" : required.length ? "after" : "none";
    const { error } = await supabase.from("tasks").insert({ organisation_id:data.workspace.organisationId,site_id:task.siteId,project_id:task.projectId,manager_id:task.managerId,team_id:task.teamId,assignee_id:task.assigneeId,created_by:user.id,title:task.title,description:task.description,priority:task.priority==="medium"?"normal":task.priority,status:"assigned",due_at:`${task.dueDate}T17:00:00+02:00`,evidence_requirement:evidenceRequirement });
    if (error) return toast(error.message,"danger");
    closeModal(); state.page = "tasks"; await refreshBackend("Task assigned successfully.");
  });
}

function showTaskDetail(taskId) {
  const task = data.tasks.find((t) => t.id === taskId);
  if (!task || !visibleTasks().some((t) => t.id === taskId)) return toast("Task not found or not available to this role.", "danger");
  const assignee = getUser(task.assigneeId);
  const team = getTeam(task.teamId);
  const status = normalizedStatus(task);
  const evidence = task.evidence || [];
  const missing = (task.requiredEvidence || []).filter((type) => !new Set(evidence.map((e) => e.type)).has(type));

  openModal(`
    <div class="modal-header"><div><div class="row" style="gap:8px;"><span class="badge ${status}">${statusLabel(status)}</span><span class="badge ${task.priority}">${task.priority}</span></div><h2>${escapeHtml(task.title)}</h2><div class="muted small" style="margin-top:6px;">${taskLabel(task)} · ${escapeHtml(getSite(task.siteId)?.name || "No site")}</div></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div>
    <div class="modal-body">
      <div class="task-detail-grid">
        <div class="stack">
          <div class="detail-section"><h3>Instructions</h3><p class="muted small" style="line-height:1.7; margin:0;">${escapeHtml(task.description)}</p>${task.rejectionReason ? `<div style="margin-top:14px; padding:12px; background:var(--danger-bg); border-radius:11px; color:var(--danger);"><strong class="small">Rework requested</strong><p class="small" style="margin:5px 0 0;">${escapeHtml(task.rejectionReason)}</p></div>` : ""}</div>
          <div class="detail-section"><div class="row-between"><h3>Evidence</h3><span class="small muted">${evidence.length} uploaded</span></div>
            ${evidence.length ? `<div class="evidence-grid">${evidence.map((e) => `<button class="evidence-card js-preview-image" data-evidence-id="${e.id}" data-task-id="${task.id}" style="padding:0;"><img src="${e.image}" alt="${escapeHtml(e.type)} evidence"><span class="evidence-overlay">${escapeHtml(e.type)} · ${escapeHtml(getUser(e.uploadedBy)?.name || "User")}</span></button>`).join("")}</div>` : `<div class="empty-state" style="padding:30px 10px;"><div class="entity-icon">${icons.camera}</div><p>No proof has been uploaded yet.</p></div>`}
            ${missing.length ? `<div class="small" style="margin-top:13px; color:var(--warning);"><strong>Still required:</strong> ${missing.map(escapeHtml).join(", ")}</div>` : `<div class="small" style="margin-top:13px; color:var(--success);"><strong>Evidence complete.</strong> All required proof types are present.</div>`}
          </div>
          <div class="detail-section"><h3>Activity trail</h3><div class="timeline">${(task.timeline || []).slice().reverse().map((item) => `<div class="timeline-item"><div class="timeline-marker"></div><div class="timeline-content"><strong>${escapeHtml(item.text)}</strong><span>${formatDate(item.at, { short: true })} · ${timeAgo(item.at)}</span></div></div>`).join("")}</div></div>
        </div>
        <div class="stack">
          <div class="detail-section"><h3>Task details</h3><div class="detail-meta">
            <div class="meta-item"><span>Business</span><strong>${escapeHtml(getBusiness(task.businessId)?.name || "Not set")}</strong></div>
            <div class="meta-item"><span>Site</span><strong>${escapeHtml(getSite(task.siteId)?.name || "Not set")}</strong></div>
            <div class="meta-item"><span>Manager</span><strong>${escapeHtml(getUser(task.managerId)?.name || "Not set")}</strong></div>
            <div class="meta-item"><span>Due date</span><strong>${formatDate(task.dueDate, { short: true })}</strong></div>
            <div class="meta-item"><span>Team</span><strong>${escapeHtml(team?.name || "Not set")}</strong></div>
            <div class="meta-item"><span>Assignee</span><strong>${escapeHtml(assignee?.name || "Team assignment")}</strong></div>
          </div></div>
          <div class="detail-section"><h3>Required proof</h3><div class="stack" style="gap:9px;">${(task.requiredEvidence || []).map((type) => {
            const supplied = evidence.some((e) => e.type === type);
            return `<div class="row-between"><span class="small" style="text-transform:capitalize;">${escapeHtml(type.replace("-", " "))}</span><span class="badge ${supplied ? "approved" : "draft"}">${supplied ? "Supplied" : "Required"}</span></div>`;
          }).join("") || `<span class="muted small">No compulsory evidence specified.</span>`}</div></div>
          ${taskActions(task, missing)}
          ${["owner", "manager"].includes(currentUser()?.role) ? `<div class="detail-section"><h3>Add proof</h3><p class="muted small">Upload a missing before, progress or after photograph on behalf of the team.</p><button class="btn btn-secondary btn-full js-upload-proof">${icons.camera} Upload photograph</button></div>` : ""}
          ${canDeleteTask(task) ? `<div class="detail-section"><h3>Delete task</h3><p class="muted small">Permanently remove ${taskLabel(task)} and all of its uploaded proof.</p><button class="btn btn-danger btn-full js-delete-task">${icons.trash} Delete task</button></div>` : ""}
        </div>
      </div>
    </div>
  `, true);

  bindTaskDetailEvents(task);
}

function taskActions(task, missing) {
  const user = currentUser();
  const status = task.status;
  if (canReviewTask(task) && status === "awaiting-review") {
    return `<div class="detail-section"><h3>Manager review</h3><p class="muted small">Review the evidence before approving or returning the work.</p><div class="stack mt-16"><button class="btn btn-success js-approve-task">${icons.check} Approve work</button><button class="btn btn-secondary js-reject-task">${icons.reset} Request rework</button></div></div>`;
  }
  if (canWorkTask(task)) {
    if (["assigned", "overdue", "rejected"].includes(status)) return `<div class="detail-section"><h3>Execution</h3><p class="muted small">Accept responsibility and start the work.</p><button class="btn btn-primary btn-full js-start-task" style="margin-top:14px;">${icons.play} Start task</button></div>`;
    if (["in-progress", "blocked"].includes(status)) return `<div class="detail-section"><h3>Execution</h3><div class="stack"><button class="btn btn-accent js-upload-proof">${icons.camera} Upload proof</button><button class="btn btn-primary js-submit-task" ${missing.length ? "disabled title='Required evidence is missing' style='opacity:.45; cursor:not-allowed;'" : ""}>${icons.check} Submit for review</button><button class="btn btn-secondary js-block-task">${icons.block} ${status === "blocked" ? "Resume task" : "Report blockage"}</button></div></div>`;
    if (status === "awaiting-review") return `<div class="detail-section"><h3>Submitted</h3><p class="muted small">The task is waiting for manager approval. More proof can still be uploaded if requested.</p><button class="btn btn-secondary btn-full js-upload-proof">${icons.camera} Add proof</button></div>`;
  }
  if (user.role === "owner" || user.role === "manager") return `<div class="detail-section"><h3>Management</h3><p class="muted small">This task is currently ${statusLabel(normalizedStatus(task)).toLowerCase()}.</p>${!["approved","completed"].includes(status) ? `<button class="btn btn-secondary btn-full js-edit-task">${icons.edit} Edit assignment</button>` : ""}</div>`;
  return "";
}

function bindTaskDetailEvents(task) {
  document.querySelector(".js-start-task")?.addEventListener("click", async () => {
    const { error } = await supabase.rpc("start_task", { p_task_id: task.id });
    if (error) return toast(error.message,"danger"); closeModal(); await refreshBackend("Task is now in progress.");
  });
  document.querySelector(".js-upload-proof")?.addEventListener("click", () => showUploadModal(task.id));
  document.querySelector(".js-submit-task")?.addEventListener("click", async () => {
    const missing = (task.requiredEvidence || []).filter((type) => !(task.evidence || []).some((e) => e.type === type));
    if (missing.length) return toast(`Upload the required ${missing.join(", ")} proof first.`, "danger");
    const { error } = await supabase.rpc("submit_task", { p_task_id: task.id });
    if (error) return toast(error.message,"danger"); closeModal(); await refreshBackend("Task submitted for manager review.");
  });
  document.querySelector(".js-block-task")?.addEventListener("click", async () => {
    if (task.status === "blocked") {
      const { error } = await supabase.rpc("resume_task", { p_task_id:task.id });
      if (error) return toast(error.message,"danger"); closeModal(); await refreshBackend("Task resumed.");
    } else {
      showBlockModal(task.id);
    }
  });
  document.querySelector(".js-approve-task")?.addEventListener("click", async () => {
    const { error } = await supabase.rpc("approve_task", { p_task_id:task.id });
    if (error) return toast(error.message,"danger"); closeModal(); await refreshBackend("Work approved and closed.");
  });
  document.querySelector(".js-reject-task")?.addEventListener("click", () => showRejectModal(task.id));
  document.querySelector(".js-edit-task")?.addEventListener("click", () => showEditTaskModal(task.id));
  document.querySelector(".js-delete-task")?.addEventListener("click", async () => {
    if (!confirm(`Delete ${taskLabel(task)} permanently? Its uploaded proof will also be removed.`)) return;
    const button = document.querySelector(".js-delete-task");
    button.disabled = true;
    button.textContent = "Deleting task...";
    const { data: result, error } = await supabase.functions.invoke("workproof-delete-task", { body: { task_id: task.id } });
    if (error || result?.error) {
      button.disabled = false;
      button.innerHTML = `${icons.trash} Delete task`;
      return toast(result?.error || error?.message || "Could not delete the task.", "danger");
    }
    closeModal();
    await refreshBackend(`${taskLabel(task)} deleted.`);
  });
  document.querySelectorAll(".js-preview-image").forEach((b) => b.addEventListener("click", () => showImagePreview(task.id, b.dataset.evidenceId)));
}

function addTimeline(task, type, text) {
  task.timeline = task.timeline || [];
  task.timeline.push({ type, text, at: new Date().toISOString() });
}

function addNotification(title, text, taskId) {
  data.notifications.unshift({ id: uid(), title, text, taskId, at: new Date().toISOString(), read: false });
}

function showUploadModal(taskId) {
  const task = data.tasks.find((t) => t.id === taskId);
  const availableTypes = [...new Set([...(task.requiredEvidence || []), "before", "during", "after", "document", "checklist"] )];
  openModal(`
    <div class="modal-header"><div><div class="eyebrow">PROOF OF WORK</div><h2>Upload evidence</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div>
    <form id="upload-proof-form">
      <div class="modal-body"><div class="form-grid">
        <div class="form-group"><label>Evidence type</label><select class="input" name="type">${availableTypes.map((t) => `<option value="${t}">${escapeHtml(t.replace("-", " "))}</option>`).join("")}</select></div>
        <div class="form-group"><label>Short note</label><input class="input" name="note" placeholder="What does this proof show?" /></div>
        <div class="form-group full"><label>Add a photo</label><div class="photo-source-grid"><label class="photo-source" for="proof-camera"><span class="entity-icon">${icons.camera}</span><strong>Take photo</strong><span>Open your phone camera</span></label><input id="proof-camera" class="visually-hidden proof-file-input" type="file" accept="image/*" capture="environment" /><label class="photo-source" for="proof-gallery"><span class="entity-icon">${icons.upload}</span><strong>Choose photo</strong><span>Select from your gallery</span></label><input id="proof-gallery" class="visually-hidden proof-file-input" type="file" accept="image/*" /></div><div id="file-name" class="small muted selected-file-name">No photo selected</div></div>
      </div></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-primary">${icons.upload} Save proof</button></div>
    </form>
  `);
  let selectedFile = null;
  document.querySelectorAll(".proof-file-input").forEach((input) => input.addEventListener("change", (event) => {
    selectedFile = event.target.files[0] || null;
    document.getElementById("file-name").textContent = selectedFile ? `Selected: ${selectedFile.name}` : "No photo selected";
  }));
  document.getElementById("upload-proof-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = selectedFile;
    if (!(file instanceof File) || !file.size) return toast("Select a photograph first.", "danger");
    const submit = event.currentTarget.querySelector("button[type=submit]");
    submit.disabled = true; submit.textContent = "Processing photo…";
    try {
      const image = await compressImage(file);
      const blob = await (await fetch(image)).blob();
      const path = `${data.workspace.organisationId}/${task.id}/${crypto.randomUUID()}.jpg`;
      const upload = await supabase.storage.from("task-evidence").upload(path,blob,{contentType:"image/jpeg",upsert:false});
      if (upload.error) throw upload.error;
      const inserted = await supabase.from("task_evidence").insert({organisation_id:data.workspace.organisationId,task_id:task.id,evidence_type:form.get("type"),storage_path:path,note:form.get("note")||"Evidence uploaded",uploaded_by:currentUser().id});
      if (inserted.error) throw inserted.error;
      closeModal(); await refreshBackend("Proof uploaded successfully.");
    } catch (error) {
      console.error(error); toast("The selected image could not be processed.", "danger"); submit.disabled = false; submit.textContent = "Save proof";
    }
  });
}

function compressImage(file, maxWidth = 1100, quality = 0.74) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showRejectModal(taskId) {
  const task = data.tasks.find((t) => t.id === taskId);
  openModal(`<div class="modal-header"><div><div class="eyebrow">QUALITY CONTROL</div><h2>Request rework</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><form id="reject-form"><div class="modal-body"><div class="form-group"><label>What must be corrected?</label><textarea class="input" name="reason" required placeholder="Give the team a clear, actionable instruction."></textarea></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-danger">Return to team</button></div></form>`);
  document.getElementById("reject-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const { error } = await supabase.rpc("reject_task",{p_task_id:task.id,p_reason:form.get("reason").trim()});
    if(error)return toast(error.message,"danger"); closeModal(); await refreshBackend("Task returned for rework.");
  });
}

function showBlockModal(taskId) {
  const task = data.tasks.find((t) => t.id === taskId);
  openModal(`<div class="modal-header"><div><div class="eyebrow">ESCALATION</div><h2>Report a blockage</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><form id="block-form"><div class="modal-body"><div class="form-group"><label>What is preventing progress?</label><textarea class="input" name="reason" required placeholder="Example: Material not delivered, access unavailable or safety risk."></textarea></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-danger">Escalate blockage</button></div></form>`);
  document.getElementById("block-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const reason = form.get("reason").trim();
    const { error } = await supabase.rpc("block_task",{p_task_id:task.id,p_reason:reason});
    if(error)return toast(error.message,"danger"); closeModal(); await refreshBackend("Blockage escalated to management.");
  });
}

function showEditTaskModal(taskId) {
  const task = data.tasks.find((t) => t.id === taskId);
  openModal(`<div class="modal-header"><div><div class="eyebrow">UPDATE ASSIGNMENT</div><h2>Edit task</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><form id="edit-task-form"><div class="modal-body"><div class="form-grid"><div class="form-group full"><label>Task title</label><input class="input" name="title" value="${escapeHtml(task.title)}" required></div><div class="form-group full"><label>Instructions</label><textarea class="input" name="description" required>${escapeHtml(task.description)}</textarea></div><div class="form-group"><label>Priority</label><select class="input" name="priority">${["low","medium","high","urgent"].map(p=>`<option ${task.priority===p?"selected":""} value="${p}">${p}</option>`).join("")}</select></div><div class="form-group"><label>Due date</label><input class="input" type="date" name="dueDate" value="${task.dueDate}" required></div><div class="form-group"><label>Assignee</label><select class="input" name="assigneeId"><option value="">Team only</option>${data.users.filter(u=>["lead","worker"].includes(u.role)).map(u=>`<option value="${u.id}" ${task.assigneeId===u.id?"selected":""}>${escapeHtml(u.name)}</option>`).join("")}</select></div><div class="form-group"><label>Team</label><select class="input" name="teamId"><option value="">No team</option>${data.teams.map(t=>`<option value="${t.id}" ${task.teamId===t.id?"selected":""}>${escapeHtml(t.name)}</option>`).join("")}</select></div></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save changes</button></div></form>`);
  document.getElementById("edit-task-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const assignee=form.get("assigneeId")||null; const team=form.get("teamId")||getUser(assignee)?.teamId||null;
    const { error } = await supabase.from("tasks").update({title:form.get("title").trim(),description:form.get("description").trim(),priority:form.get("priority")==="medium"?"normal":form.get("priority"),due_at:`${form.get("dueDate")}T17:00:00+02:00`,assignee_id:assignee,team_id:team}).eq("id",task.id);
    if(error)return toast(error.message,"danger"); closeModal(); await refreshBackend("Task updated.");
  });
}

function showImagePreview(taskId, evidenceId) {
  const evidence = data.tasks.find((t) => t.id === taskId)?.evidence?.find((e) => e.id === evidenceId);
  if (!evidence) return;
  openModal(`<div class="modal-header"><div><div class="eyebrow">${escapeHtml(evidence.type.toUpperCase())} PROOF</div><h2>${escapeHtml(evidence.note || "Evidence")}</h2><div class="muted small">Uploaded by ${escapeHtml(getUser(evidence.uploadedBy)?.name || "User")} · ${formatDate(evidence.uploadedAt, { short: true })}</div></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><div class="modal-body" style="padding:0;"><img src="${evidence.image}" alt="Evidence preview" style="display:block; width:100%; max-height:72vh; object-fit:contain; background:#111827;"></div>`);
}

function showResetModal() {
  openModal(`<div class="modal-header"><div><div class="eyebrow">DEMO DATA</div><h2>Reset the workspace?</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><div class="modal-body"><p class="muted" style="line-height:1.7;">This removes tasks, uploads and changes made in this browser, then restores the original pilot data.</p></div><div class="modal-footer"><button class="btn btn-secondary js-close-modal">Cancel</button><button class="btn btn-danger" id="confirm-reset">Reset data</button></div>`);
  document.getElementById("confirm-reset").addEventListener("click", () => { data = cloneSeed(); saveData(); closeModal(); renderPage(); toast("Demo data restored."); });
}

function showAddUserModal() {
  const canCreateManager=currentUser().role==="owner";
  openModal(`<div class="modal-header"><div><div class="eyebrow">WORKFORCE ACCESS</div><h2>Add a user</h2></div><button class="icon-btn subtle js-close-modal">${icons.close}</button></div><form id="add-user-form"><div class="modal-body"><div class="form-grid"><div class="form-group"><label>Full name</label><input class="input" name="name" required></div><div class="form-group"><label>Username</label><input class="input" name="username" required placeholder="e.g. sipho.dlamini"></div><div class="form-group"><label>Cellphone (optional)</label><input class="input" name="phone" placeholder="+27 ..."></div><div class="form-group"><label>Temporary password</label><input class="input" type="password" name="password" minlength="8" required></div><div class="form-group"><label>Role</label><select class="input" name="role">${canCreateManager?'<option value="owner">Owner</option><option value="manager">Construction manager</option>':''}<option value="lead">Team leader</option><option value="worker" selected>Worker</option></select></div><div class="form-group"><label>Team</label><select class="input" name="teamId"><option value="">No team yet</option>${data.teams.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("")}</select></div></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary js-close-modal">Cancel</button><button type="submit" class="btn btn-primary">Create account</button></div></form>`);
  document.getElementById("add-user-form").addEventListener("submit", async (event) => {
    event.preventDefault(); const form=new FormData(event.currentTarget); const role=uiToDbRole(form.get("role"));
    const body={action:"create",full_name:form.get("name").trim(),username:form.get("username").trim(),phone:form.get("phone").trim()||null,password:form.get("password"),role,team_id:form.get("teamId")||null,title:roleLabel(form.get("role"))};
    const submit = event.currentTarget.querySelector("button[type=submit]");
    submit.disabled = true;
    submit.textContent = "Creating account...";
    try {
      const result = await invokeSecureFunction("workproof-user-admin", body);
      closeModal();
      await refreshBackend(`${body.full_name} created as ${result.username}.`);
    } catch (error) {
      submit.disabled = false;
      submit.textContent = "Create account";
      toast(error.message, "danger");
    }
  });
}

function openModal(content, large = false) {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal ${large ? "modal-lg" : ""}" role="dialog" aria-modal="true">${content}</div></div>`;
  injectIcons(modalRoot);
  modalRoot.querySelectorAll(".js-close-modal").forEach((b) => b.addEventListener("click", closeModal));
  modalRoot.querySelector(".modal-backdrop").addEventListener("click", (e) => { if (e.target.classList.contains("modal-backdrop")) closeModal(); });
  document.addEventListener("keydown", escapeModal);
}

function closeModal() {
  modalRoot.innerHTML = "";
  document.removeEventListener("keydown", escapeModal);
}

function escapeModal(event) { if (event.key === "Escape") closeModal(); }

function exportReportCsv() {
  const rows = [["Task ID", "Title", "Business", "Site", "Assignee", "Team", "Manager", "Priority", "Status", "Due date", "Evidence count"]];
  visibleTasks().forEach((task) => rows.push([taskLabel(task), task.title, getBusiness(task.businessId)?.name || "", getSite(task.siteId)?.name || "", getUser(task.assigneeId)?.name || "", getTeam(task.teamId)?.name || "", getUser(task.managerId)?.name || "", task.priority, statusLabel(normalizedStatus(task)), task.dueDate, String(task.evidence?.length || 0)]));
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `workproof-report-${isoDate(0)}.csv`; link.click(); URL.revokeObjectURL(link.href); toast("CSV report exported.");
}

function showNotifications() {
  const existing = document.querySelector(".popover"); if (existing) { existing.remove(); return; }
  const popover = document.createElement("div"); popover.className = "popover";
  popover.innerHTML = `<div class="popover-header"><strong>Notifications</strong><button class="btn btn-ghost btn-sm" id="mark-read">Mark all read</button></div><div class="popover-body">${data.notifications.slice(0, 8).map((n) => `<button class="activity-item js-notification" data-task-id="${n.taskId || ""}" style="width:100%; background:${n.read ? "white" : "#fffbeb"}; border-left:0; border-right:0; border-bottom:0; text-align:left;"><span class="activity-dot ${n.read ? "success" : "warning"}"></span><div class="activity-copy"><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(n.text)}</span></div><span class="activity-time">${timeAgo(n.at)}</span></button>`).join("") || emptyInline("No notifications")}</div>`;
  document.body.appendChild(popover);
  popover.querySelector("#mark-read")?.addEventListener("click", () => { data.notifications.forEach((n) => n.read = true); saveData(); popover.remove(); updateShell(); });
  popover.querySelectorAll(".js-notification").forEach((b) => b.addEventListener("click", () => { popover.remove(); const n = data.notifications.find((x) => x.taskId === b.dataset.taskId); if (n) n.read = true; saveData(); updateShell(); if (b.dataset.taskId) showTaskDetail(b.dataset.taskId); }));
  setTimeout(() => document.addEventListener("click", function outside(e) { if (!popover.contains(e.target) && !document.getElementById("notification-btn").contains(e.target)) { popover.remove(); document.removeEventListener("click", outside); } }), 0);
}

function showGlobalSearch() {
  document.querySelector(".popover")?.remove();
  const popover = document.createElement("div"); popover.className = "popover search-popover";
  popover.innerHTML = `<input id="global-search" class="input" placeholder="Search tasks, sites or people" autofocus><div id="global-results" class="popover-body"></div>`;
  document.body.appendChild(popover);
  const input = popover.querySelector("#global-search");
  const results = popover.querySelector("#global-results");
  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = `<div class="empty-state" style="padding:24px;"><p>Start typing to search the workspace.</p></div>`; return; }
    const matches = visibleTasks().filter((t) => [taskLabel(t), t.title, getSite(t.siteId)?.name, getUser(t.assigneeId)?.name].join(" ").toLowerCase().includes(q)).slice(0, 8);
    results.innerHTML = matches.map((t) => `<button class="search-result js-search-result" data-task-id="${t.id}" style="width:100%; border:0; background:transparent; text-align:left;"><span class="task-ref">${taskLabel(t)}</span><span><strong>${escapeHtml(t.title)}</strong><span>${escapeHtml(getSite(t.siteId)?.name || "")}</span></span></button>`).join("") || `<div class="empty-state" style="padding:24px;"><p>No matching tasks found.</p></div>`;
    results.querySelectorAll(".js-search-result").forEach((b) => b.addEventListener("click", () => { popover.remove(); showTaskDetail(b.dataset.taskId); }));
  };
  input.addEventListener("input", render); input.focus(); render();
  setTimeout(() => document.addEventListener("click", function outside(e) { if (!popover.contains(e.target) && !document.getElementById("global-search-btn").contains(e.target)) { popover.remove(); document.removeEventListener("click", outside); } }), 0);
}

// Global event bindings
document.getElementById("login-account").addEventListener("change", updateLoginFields);
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = document.getElementById("login-btn");
  const account = document.getElementById("login-account").value;
  const identifier = (account === "__other__" ? document.getElementById("login-identifier").value : account).trim();
  const password = document.getElementById("login-password").value;
  if (!identifier) return toast("Select your name or choose first time on this device.", "danger");
  button.disabled = true;
  button.firstChild.textContent = "Signing in... ";
  const { data: login, error } = await supabase.functions.invoke("workproof-login", { body: { identifier, password } });
  if (error || login?.error) {
    button.disabled = false; button.firstChild.textContent = "Enter workspace ";
    return toast(login?.error || error?.message || "Unable to sign in.", "danger");
  }
  const session = await supabase.auth.setSession({ access_token: login.access_token, refresh_token: login.refresh_token });
  if (session.error) { button.disabled = false; return toast(session.error.message, "danger"); }
  try { await loadBackendData(); showApp(); }
  catch (loadError) { button.disabled = false; toast(loadError.message, "danger"); }
});
document.getElementById("logout-btn").addEventListener("click", async () => { await supabase.auth.signOut(); state.userId = null; data = emptyWorkspace(); showLogin(); });
document.querySelectorAll(".nav-item[data-page], .bottom-nav-item[data-page]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.page)));
document.getElementById("create-task-btn").addEventListener("click", showCreateTaskModal);
document.getElementById("bottom-create-task").addEventListener("click", () => {
  if (canCreateTask()) showCreateTaskModal();
  else {
    const task = visibleTasks().find((t) => ["in-progress", "blocked", "awaiting-review"].includes(t.status)) || visibleTasks().find((t) => !["approved", "completed"].includes(t.status));
    task ? showTaskDetail(task.id) : toast("No active task available.");
  }
});
document.getElementById("mobile-menu-btn").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.getElementById("notification-btn").addEventListener("click", showNotifications);
document.getElementById("global-search-btn").addEventListener("click", showGlobalSearch);

injectIcons();
renderLoginAccounts();
async function initialise() {
  if (!configured) return toast("WorkProof is missing its Supabase configuration.", "danger");
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return showLogin();
  try { await loadBackendData(); showApp(); }
  catch (error) { console.error(error); showLogin(); toast(error.message || "Could not load the workspace.", "danger"); }
}
initialise();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch((error) => console.warn("Service worker not registered", error)));
}
