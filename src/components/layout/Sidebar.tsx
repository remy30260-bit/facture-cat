"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, BookOpen, Receipt, BarChart2, LogOut, User } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/",             label: "Dashboard",      icon: LayoutDashboard },
  { href: "/factures",     label: "Factures",       icon: FileText },
  { href: "/comptabilite", label: "Comptabilité",   icon: BookOpen },
  { href: "/notes-frais",  label: "Notes de frais", icon: Receipt },
  { href: "/bilan",        label: "Bilan / Liasse", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-brand-beige-dark flex flex-col h-full shadow-soft">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-beige-dark">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="Facture Cat logo">
            <rect width="36" height="36" rx="10" fill="#FF8C42"/>
            <path d="M9 13c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V13z" fill="white" opacity="0.9"/>
            <rect x="12" y="16" width="8" height="1.5" rx="0.75" fill="#FF8C42"/>
            <rect x="12" y="19" width="5" height="1.5" rx="0.75" fill="#FF8C42" opacity="0.6"/>
            <path d="M11 13 L8 9 L13 11z" fill="#FF8C42"/>
            <path d="M25 13 L28 9 L23 11z" fill="#FF8C42"/>
            <circle cx="15.5" cy="14" r="1" fill="#FF8C42"/>
            <circle cx="20.5" cy="14" r="1" fill="#FF8C42"/>
          </svg>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">Facture Cat</p>
            <p className="text-xs text-brand-gray-soft leading-tight">Comptabilité IA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive ? "bg-brand-orange-pale text-brand-orange shadow-soft" : "text-brand-gray-soft hover:bg-brand-beige hover:text-gray-800"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer utilisateur */}
      <div className="px-4 py-4 border-t border-brand-beige-dark space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-beige">
          <div className="w-7 h-7 rounded-full bg-brand-orange-pale flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-brand-orange" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{userEmail ?? "Mon compte"}</p>
            <p className="text-xs text-brand-gray-soft">Connecté</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-brand-gray-soft hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={13} /> Se déconnecter
        </button>
      </div>
    </aside>
  );
}
