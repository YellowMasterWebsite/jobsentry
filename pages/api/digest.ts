import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { overallScore, findWarmIntros } from "@/lib/match";
import { sendEmail } from "@/lib/email";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await prisma.user.findFirst({ where: { email: "tulika.jatrele@gmail.com" }, include: { requirements: true, connections: true } });
  if (!user) return res.status(200).json({ ok: true, note: "no user" });

  const now = new Date();
  const hours = Number(process.env.DIGEST_CRON_EVERY_HOURS || 3);
  const since = new Date(now.getTime() - (hours * 3600 * 1000));

  const jobs = await prisma.job.findMany({ where: { postedAt: { gte: since } } });
  const matches: any[] = [];

  for (const r of user.requirements) {
    for (const j of jobs) {
      const score = overallScore(j as any, r as any);
      if (score > 0.35) {
        const intros = findWarmIntros(j.company, user.connections);
        matches.push({ r, j, score, intros });
      }
    }
  }

  // Dedupe by job URL and group by requirement title
  const seen = new Set<string>();
  const grouped = new Map<string, any[]>();
  for (const m of matches.sort((a,b)=>b.score-a.score)) {
    if (seen.has(m.j.url)) continue;
    seen.add(m.j.url);
    const key = m.r.title;
    const arr = grouped.get(key) || [];
    arr.push(m);
    grouped.set(key, arr);
  }

  const sections = Array.from(grouped.entries()).map(([title, items]) => {
    const lis = items.slice(0, 20).map(({ j, intros }) => `
      <li style="margin-bottom:12px">
        <a href="${j.url}"><b>${j.title}</b> — ${j.company}${j.location?` • ${j.location}`:""}</a>
        ${j.source?`<span style="opacity:.7"> [${j.source}]</span>`:""}
        ${typeof j.applicants === 'number' ? `<span style="background:#eef;padding:2px 6px;border-radius:8px;margin-left:6px">${j.applicants} applicants</span>` : ""}
        <div style="font-size:12px;opacity:.85">Warm intros: ${intros.map((c:any)=>`<a href='${c.linkedin||"#"}'>${c.name}</a>`).join(', ') || '—'}</div>
      </li>`).join("");
    return `<h3>${title}</h3><ol>${lis}</ol>`;
  }).join("<hr style=\"margin:16px 0\"/>");

  if (!sections) return res.json({ ok: true, note: "no matches" });

  const html = `
    <div>
      <h2>JobSentry Digest</h2>
      <p>Window: last ${hours} hours — ${new Date().toLocaleString()}</p>
      ${sections}
      <p style="margin-top:16px;font-size:12px;opacity:.7">Sources: LinkedIn (companion), Greenhouse, Lever, Custom.
      Manage preferences at ${process.env.WEB_ORIGIN}/</p>
    </div>`;

  await sendEmail(user.email, `JobSentry: New matches (${new Date().toLocaleTimeString()})`, html);
  res.json({ ok: true, groups: grouped.size });
}
