"use client";
import { useState } from "react";

export default function Home() {
  const [title, setTitle] = useState("PM, Infra, NYC/Remote");
  const [keywords, setKeywords] = useState("product manager, infrastructure, cloud, ai");
  const [excludes, setExcludes] = useState("principal, director");
  const [locations, setLocations] = useState("New York, Remote");
  const [seniority, setSeniority] = useState("Mid, Senior");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [recencyHours, setRecencyHours] = useState(3);
  const [maxApplicants, setMaxApplicants] = useState<number | "">(25);
  const [sources, setSources] = useState("linkedin,greenhouse,lever");

  async function createReq() {
    await fetch("/api/requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, keywords, excludes, locations, seniority, remoteOnly, recencyHours, maxApplicants: maxApplicants || null, sources })
    });
    alert("Requirement saved.");
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">JobSentry — Create a Requirement Set</h1>
      <div className="grid gap-3">
        <input className="border p-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <input className="border p-2" value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="Keywords (comma)" />
        <input className="border p-2" value={excludes} onChange={e=>setExcludes(e.target.value)} placeholder="Excludes (comma)" />
        <input className="border p-2" value={locations} onChange={e=>setLocations(e.target.value)} placeholder="Locations (comma)" />
        <input className="border p-2" value={seniority} onChange={e=>setSeniority(e.target.value)} placeholder="Seniority" />
        <label className="flex items-center gap-2"><input type="checkbox" checked={remoteOnly} onChange={e=>setRemoteOnly(e.target.checked)} />Remote only</label>
        <label>Recency hours <input className="border p-2 ml-2 w-24" type="number" value={recencyHours} onChange={e=>setRecencyHours(parseInt(e.target.value))}/></label>
        <label>Max applicants (LinkedIn only) <input className="border p-2 ml-2 w-24" type="number" value={maxApplicants as number} onChange={e=>setMaxApplicants(parseInt(e.target.value))}/></label>
        <input className="border p-2" value={sources} onChange={e=>setSources(e.target.value)} placeholder="Sources (comma)" />
        <button onClick={createReq} className="bg-black text-white px-4 py-2 rounded">Save</button>
      </div>
    </main>
  );
}
