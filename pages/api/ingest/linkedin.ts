import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers["x-jobsentry-secret"] !== process.env.BACKEND_INGEST_SECRET) return res.status(401).end();
  const items = (req.body as any)?.items || [];
  for (const j of items) {
    const job = {
      title: j.title,
      company: j.company,
      location: j.location || "",
      url: j.url,
      source: "linkedin",
      postedAt: j.postedAt ? new Date(j.postedAt) : new Date(),
      applicants: typeof j.applicants === "number" ? j.applicants : null,
      rawJson: JSON.stringify(j)
    };
    try { await prisma.job.create({ data: job as any }); } catch {}
  }
  res.json({ ok: true, count: items.length });
}
