import { distance } from "fastest-levenshtein";
import { differenceInHours } from "date-fns";
import type { Job, Requirement, Connection } from "@prisma/client";

export function textScore(text: string, incs: string[], excs: string[]): number {
  const T = text.toLowerCase();
  const incScore = incs.length ? incs.filter(k => T.includes(k)).length / incs.length : 0.5;
  const excPenalty = excs.length ? excs.filter(k => T.includes(k)).length / excs.length : 0;
  return Math.max(0, incScore - excPenalty);
}

export function timeScore(postedAt: Date, recencyHours: number): number {
  const h = Math.max(0, differenceInHours(new Date(), postedAt));
  return Math.max(0, 1 - Math.min(1, h / Math.max(1, recencyHours)));
}

export function companyMatch(companyA: string, companyB?: string | null): number {
  if (!companyB) return 0;
  const a = companyA.toLowerCase();
  const b = companyB.toLowerCase();
  const d = distance(a, b);
  return 1 - Math.min(1, d / Math.max(a.length, b.length));
}

export function findWarmIntros(company: string, cons: Connection[]) {
  return cons
    .map(c => ({ c, score: companyMatch(company, c.company) }))
    .filter(x => x.score > 0.6)
    .sort((a, b) => (b.c.lastMessagedAt?.getTime() || 0) - (a.c.lastMessagedAt?.getTime() || 0))
    .slice(0, 5)
    .map(x => x.c);
}

export function overallScore(job: Job, req: Requirement): number {
  const incs = req.keywords.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const excs = req.excludes.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const base = textScore(`${job.title} ${job.company} ${job.location ?? ""}`, incs, excs);
  const t = timeScore(job.postedAt, req.recencyHours || 3);
  const applicantBonus = (req.maxApplicants && job.applicants && job.applicants <= req.maxApplicants) ? 0.15 : 0;
  return Math.min(1, 0.6 * base + 0.4 * t + applicantBonus);
}
