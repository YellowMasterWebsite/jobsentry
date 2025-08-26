"use client";
import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/import/connections", { method: "POST", body: fd });
    const j = await res.json();
    setMsg(JSON.stringify(j));
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Import LinkedIn Connections CSV</h1>
      <form onSubmit={upload} className="grid gap-3">
        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
        <button className="bg-black text-white px-4 py-2 rounded" disabled={!file}>Upload</button>
      </form>
      {msg && <pre className="mt-4 p-3 bg-gray-100">{msg}</pre>}
    </main>
  );
}
