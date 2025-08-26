import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await prisma.user.upsert({ where: { email: "you@example.com" }, update: {}, create: { email: "you@example.com", name: "You" } });
  if (req.method === "POST") {
    const data = req.body;
    const r = await prisma.requirement.create({ data: { ...data, userId: user.id } });
    return res.json(r);
  }
  if (req.method === "GET") {
    const rs = await prisma.requirement.findMany({ where: { userId: user.id } });
    return res.json(rs);
  }
  res.status(405).end();
}
