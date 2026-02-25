"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type TopItem = { serviceId: string; count: number; name?: string };

export default function MostRequestedServices({ top }: { top: TopItem[] }) {
  const total = top.reduce((s, t) => s + t.count, 0) || 1;
  // build chart-friendly data (reverse for horizontal bars)
  const data = top.map((t) => ({ name: t.name ?? t.serviceId, value: Math.round((t.count / total) * 100), rawCount: t.count })).reverse();

  return (
    <div className="bg-card/80 border border-border rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Servicios más solicitados</h3>
        <select className="bg-card/80 px-2 py-1 rounded-md text-sm text-muted-foreground">
          <option>Este mes</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart layout="vertical" data={data} margin={{ left: 0, right: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={140} tick={{ fill: "var(--muted-foreground)" }} />
            <Tooltip formatter={(v: any) => `${Number(v ?? 0)}%`} />
            <Bar dataKey="value" barSize={14} radius={4}>
              {data.map((entry, idx) => (
                <Cell key={entry.name} fill={idx === data.length - 1 ? "var(--primary)" : "rgba(42,123,253,0.8)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
