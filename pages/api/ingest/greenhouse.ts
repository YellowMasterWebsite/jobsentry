import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { org } = req.query; // e.g., ?org=openaicom
  if (!org) return res.status(400).json({ error: "org required" });
  const url = `https://boards-api.greenhouse.io/v1/boards/${org}/jobs?content=true`;
  let data: any = { jobs: [] };
  try {
    const r = await fetch(url);
    data = await r.json();
  } catch {}
  const jobs: any[] = data.jobs || [];
  for (const j of jobs) {
    const job = {
      title: j.title,
      company: String(org).trim(), // use the org slug as company
      location: j?.location?.name || "",
      url: j.absolute_url,
      source: "greenhouse",
      postedAt: j.updated_at ? new Date(j.updated_at) : new Date(),
      rawJson: JSON.stringify(j)
    };
    try { await prisma.job.create({ data: job as any }); } catch {}
  }
  res.json({ ok: true, count: jobs.length });
}
