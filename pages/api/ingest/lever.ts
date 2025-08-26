import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { org } = req.query; // e.g., ?org=vercel
  if (!org) return res.status(400).json({ error: "org required" });
  const url = `https://api.lever.co/v0/postings/${org}?mode=json`;
  let data: any[] = [];
  try {
    const r = await fetch(url);
    data = await r.json();
  } catch {}
  for (const j of data) {
    const job = {
      title: j.text,
      company: String(org),
      location: j.categories?.location || "",
      url: j.hostedUrl,
      source: "lever",
      postedAt: j.createdAt ? new Date(j.createdAt) : new Date(),
      rawJson: JSON.stringify(j)
    };
    try { await prisma.job.create({ data: job as any }); } catch {}
  }
  res.json({ ok: true, count: data.length });
}
