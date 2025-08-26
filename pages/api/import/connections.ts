// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: String(err) });
    const file = files.file?.[0] || files.file;
    if (!file) return res.status(400).json({ error: "file required" });
    const csv = fs.readFileSync(file.filepath, "utf8");
    const lines = csv.split(/\r?\n/).filter(Boolean);
    const headers = (lines.shift() || "").split(",");
    const idx = (name: string) => headers.findIndex(h => h.toLowerCase().includes(name));
    const nameI = idx("first name");
    const lastI = idx("last name");
    const companyI = idx("company");
    const profileI = idx("profile");
    const user = await prisma.user.upsert({ where: { email: "you@example.com" }, update: {}, create: { email: "you@example.com", name: "You" } });
    let count = 0;
    for (const line of lines) {
      const cols = line.split(",");
      const name = [cols[nameI], cols[lastI]].filter(Boolean).join(" ").trim() || cols[0];
      await prisma.connection.create({ data: {
        userId: user.id,
        name,
        company: cols[companyI] || null,
        linkedin: cols[profileI] || null
      }});
      count++;
    }
    res.json({ ok: true, count });
  });
}
