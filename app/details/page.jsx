"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/services/supabaseClient";

export default function SecurityAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  async function trySelect(tableCandidates, cols = "*", opts = {}) {
    for (const t of tableCandidates) {
      try {
        const res = await supabase.from(t).select(cols, { count: "exact" }).limit(opts.limit ?? 500);
        if (!res.error) return { data: res.data, count: res.count, table: t };
      } catch {}
    }
    return { data: null, count: 0, table: null, error: true };
  }

  async function loadAll() {
    setLoading(true);
    try {
      const interviewsRes = await trySelect(
        ["Interviews", "public.Interviews", "interviews"],
        "id,created_at,jobposition,jobdescription,duration,type,questionlist,useremail,interview_id"
      );
      const usersRes = await trySelect(["users", "public.users"], "id,email,name,picture,created_at,credits");
      setInterviews(interviewsRes.data ?? []);
      setUsers(usersRes.data ?? []);
    } catch {
      toast.error?.("Failed to load data") ?? toast("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function formatDate(iso) {
    try {
      return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  async function deleteInterview(interview_id) {
    if (!confirm(`Delete interview ${interview_id}? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const candidates = ["Interviews", "public.Interviews", "interviews"];
      for (const t of candidates) {
        const { error } = await supabase.from(t).delete().eq("interview_id", interview_id);
        if (!error) break;
      }
      toast.success?.("Interview deleted") ?? toast("Interview deleted");
      await loadAll();
    } catch {
      toast.error?.("Delete failed") ?? toast("Delete failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveInterview(edit) {
    if (!edit?.interview_id) return;
    setSaving(true);
    try {
      const payload = {
        jobposition: edit.jobposition,
        jobdescription: edit.jobdescription,
        duration: edit.duration,
        type: edit.type,
        questionlist: edit.questionlist ? JSON.parse(edit.questionlist) : null,
        useremail: edit.useremail,
      };
      const candidates = ["Interviews", "public.Interviews", "interviews"];
      let updated = false;
      for (const t of candidates) {
        const { error } = await supabase.from(t).update(payload).eq("interview_id", edit.interview_id);
        if (!error) {
          updated = true;
          break;
        }
      }
      if (updated) {
        toast.success?.("Interview updated") ?? toast("Interview updated");
        setEditingInterview(null);
        await loadAll();
      } else {
        toast.error?.("Update failed") ?? toast("Update failed");
      }
    } catch {
      toast.error?.("Update error") ?? toast("Update error");
    } finally {
      setSaving(false);
    }
  }

  async function updateUserCredits(email, credits) {
    setSaving(true);
    try {
      const { error } = await supabase.from("users").update({ credits }).eq("email", email);
      if (error) toast.error?.("Could not update credits") ?? toast("Could not update credits");
      else {
        toast.success?.("Credits updated") ?? toast("Credits updated");
        await loadAll();
      }
    } catch {
      toast.error?.("Update failed") ?? toast("Update failed");
    } finally {
      setSaving(false);
    }
  }

  const visibleInterviews = interviews
    .filter((it) => (filterProject ? (it.jobposition || "").toLowerCase().includes(filterProject.toLowerCase()) : true))
    .filter((it) => (search ? ((it.jobposition || "") + (it.jobdescription || "") + (it.interview_id || "")).toLowerCase().includes(search.toLowerCase()) : true))
    .sort((a, b) => {
      if (sortBy === "created_at") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "jobposition") return String(a.jobposition || "").localeCompare(String(b.jobposition || ""));
      return 0;
    });

  function exportCSV() {
    try {
      const rows = visibleInterviews.map((r) => ({
        id: r.interview_id || r.id || "",
        jobposition: r.jobposition || "",
        useremail: r.useremail || "",
        created_at: r.created_at || "",
        duration: r.duration || "",
        type: r.type || "",
      }));
      if (rows.length === 0) {
        toast("No interviews to export");
        return;
      }
      const header = Object.keys(rows[0]).join(",");
      const csv = [header, ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interviews_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success?.("CSV downloaded") ?? toast("CSV downloaded");
    } catch {
      toast.error?.("Export failed") ?? toast("Export failed");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-4">
            <div>
              <h2 className="text-2xl tracking-tight font-semibold text-slate-800">Interviews Dashboard</h2>
              <p className="text-sm text-slate-500 mt-1">Manage interview records and users</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-700">
                  Interviews <span className="font-medium">{interviews.length}</span>
                </span>
                <span className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-700">
                  Users <span className="font-medium">{users.length}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 border bg-white rounded-md px-3 py-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interviews"
                className="outline-none text-sm w-52 placeholder:text-slate-400"
              />
            </div>
            <Button onClick={loadAll} disabled={loading}>{loading ? "Loading…" : "Reload"}</Button>
            <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
            <Button variant="ghost" onClick={() => router.push("/settings")}>Settings</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <input
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    placeholder="Filter by position"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md px-2 py-2 text-sm">
                  <option value="created_at">Newest</option>
                  <option value="jobposition">Position</option>
                </select>
              </div>
              <div className="text-sm text-slate-500">Showing <span className="font-medium ml-1">{visibleInterviews.length}</span></div>
            </div>

            <div className="max-h-[64vh] overflow-auto">
              <table className="w-full min-w-200 table-fixed text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-slate-600">Position</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-600">Description</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-600 hidden lg:table-cell">User Email</th>
                    <th className="text-left px-4 py-3 text-xs text-slate-600">Created</th>
                    <th className="px-4 py-3 text-xs text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInterviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">No interviews found</td>
                    </tr>
                  ) : (
                    visibleInterviews.map((it) => (
                      <tr key={it.interview_id || it.id} className="border-b hover:bg-slate-50">
                        <td className="px-4 py-3 align-top w-52">
                          <div className="font-medium text-slate-800">{it.jobposition || "—"}</div>
                          <div className="text-xs text-slate-500 mt-1">{it.type || ""} • {it.duration || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-sm align-top">
                          <div className="line-clamp-2 text-slate-700">{it.jobdescription || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-sm align-top hidden lg:table-cell">
                          <div className="text-slate-600">{it.useremail || "—"}</div>
                          <div className="text-xs text-slate-400 mt-1">#{it.interview_id || it.id}</div>
                        </td>
                        <td className="px-4 py-3 text-sm align-top">
                          {formatDate(it.created_at)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setEditingInterview({
                              interview_id: it.interview_id,
                              jobposition: it.jobposition,
                              jobdescription: it.jobdescription,
                              duration: it.duration,
                              type: it.type,
                              questionlist: JSON.stringify(it.questionlist || null),
                              useremail: it.useremail
                            })}>Edit</Button>
                            <Button onClick={() => deleteInterview(it.interview_id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-lg font-medium mb-4">Users</h3>
            <div className="space-y-2 max-h-[64vh] overflow-auto">
              {users.length === 0 ? (
                <div className="text-sm text-slate-500">No users found</div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-slate-800 truncate">{u.name || "User"}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email || "—"}</div>
                    </div>

                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center min-w-12 h-9 px-3 rounded-md bg-slate-100 text-sm font-semibold text-slate-800">
                        {u.credits ?? 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>

        {editingInterview && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit interview {editingInterview.interview_id}</h3>
                <div>
                  <Button variant="ghost" onClick={() => setEditingInterview(null)}>Close</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input value={editingInterview.jobposition ?? ""} onChange={(e) => setEditingInterview({ ...editingInterview, jobposition: e.target.value })} className="border rounded px-3 py-2" placeholder="Job position" />
                <textarea value={editingInterview.jobdescription ?? ""} onChange={(e) => setEditingInterview({ ...editingInterview, jobdescription: e.target.value })} className="border rounded px-3 py-2" rows={4} placeholder="Job description" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={editingInterview.duration ?? ""} onChange={(e) => setEditingInterview({ ...editingInterview, duration: e.target.value })} className="border rounded px-3 py-2" placeholder="Duration" />
                  <input value={editingInterview.type ?? ""} onChange={(e) => setEditingInterview({ ...editingInterview, type: e.target.value })} className="border rounded px-3 py-2" placeholder="Type" />
                </div>
                <textarea value={editingInterview.questionlist ?? ""} onChange={(e) => setEditingInterview({ ...editingInterview, questionlist: e.target.value })} className="border rounded px-3 py-2" rows={3} placeholder='Question list as JSON (e.g. ["q1","q2"])' />
                <input value={editingInterview.useremail ?? ""} onChange={(e) => setEditingInterview({ ...editingInterview, useremail: e.target.value })} className="border rounded px-3 py-2" placeholder="User email" />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingInterview(null)}>Cancel</Button>
                <Button onClick={() => saveInterview(editingInterview)} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
