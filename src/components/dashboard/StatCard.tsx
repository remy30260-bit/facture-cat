"use client";
import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type Color = "orange" | "green" | "blue" | "purple";

const colorMap: Record<Color, { bg: string; icon: string; text: string }> = {
  orange: { bg: "bg-brand-orange-pale", icon: "text-brand-orange", text: "text-brand-orange" },
  green:  { bg: "bg-green-50",          icon: "text-green-500",    text: "text-green-600"  },
  blue:   { bg: "bg-blue-50",           icon: "text-blue-500",     text: "text-blue-600"   },
  purple: { bg: "bg-purple-50",         icon: "text-purple-500",   text: "text-purple-600" },
};

export function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: Color;
}) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-brand-beige-dark hover:shadow-soft transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-brand-gray-soft font-medium">{label}</span>
        <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", c.bg)}>
          <Icon size={18} className={c.icon} strokeWidth={2} />
        </div>
      </div>
      <p className={clsx("text-2xl font-bold", c.text)}>{value}</p>
    </div>
  );
}
