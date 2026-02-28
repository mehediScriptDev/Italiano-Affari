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
];

const linkClass = "no-underline text-sm text-[#333] font-medium py-2 px-3 rounded-none transition-[background] duration-200";
const activeLinkClass = "border-b-2 border-black !text-black !font-bold";

export default function NavPartner() {
  const pathname = usePathname();

  return (
    <nav className="bg-white py-3.75 px-4 border-b border-[#ddd]">
      <div className="max-w-300 mx-auto">
        <ul className="flex gap-5 list-none m-0 p-0">
          {navLinks.map(({ href, label }) => (
            <li key={href} className="relative">
              <Link href={href} className={`${linkClass} ${pathname === href ? activeLinkClass : ""}`}>
                {label}
              </Link>
            </li>
          ))}
          <li className="relative">
            <a
              href="https://contents.psicopatici.com/"
              className={linkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              Libreria Contenuti
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
