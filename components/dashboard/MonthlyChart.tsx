"use client";
import React, { useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type SeriesPoint = { date: string; ingresos: number; ordenes: number };

export default function MonthlyChart({ series }: { series: SeriesPoint[] }) {
  // always show full month series provided by server
  const displayed = useMemo(() => (series ?? []) as SeriesPoint[], [series]);

  const formatter = (v: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(v);

  return (
    <div className="bg-card/80 border border-border rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-white">Evolución del mes</h3>
      </div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={displayed}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip formatter={(value: any) => formatter(Number(value ?? 0))} />
            <Line type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
