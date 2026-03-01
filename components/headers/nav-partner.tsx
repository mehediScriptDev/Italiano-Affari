"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Statistiche" },
  { href: "/agent-management", label: "Gestione Agenti" },
  { href: "/orders", label: "Ordini / Report" },
  { href: "/contacts", label: "Contatti" },
  { href: "/wallet", label: "Portafoglio" },
  { href: "/media-library", label: "Libreria Contenuti" },
];

export default function NavPartner() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-[#eef0f4]" style={{ boxShadow: '0 1px 3px rgba(19, 19, 31, 0.04)' }}>
      <div className="container">
        <ul className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-none">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className={[
                    "inline-block text-[13px] font-medium px-3.5 py-1.5 rounded-lg no-underline",
                    "transition-all duration-200 ease-out",
                    isActive
                      ? "text-white font-semibold"
                      : "text-slate-500 hover:bg-[#f6f8fb] hover:text-[#13131f]",
                  ].join(" ")}
                  style={isActive ? { background: 'linear-gradient(135deg, #13131f 0%, #1e1e30 100%)', boxShadow: '0 2px 6px rgba(19, 19, 31, 0.2)' } : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

