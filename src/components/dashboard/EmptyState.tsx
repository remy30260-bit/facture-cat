"use client";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

export function EmptyState({ title, description, icon: Icon, action }: {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-card border border-brand-beige-dark flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-orange-pale flex items-center justify-center mb-4">
        <Icon size={24} className="text-brand-orange" strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-brand-gray-soft max-w-xs leading-relaxed mb-5">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-orange-light transition-colors shadow-soft"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
