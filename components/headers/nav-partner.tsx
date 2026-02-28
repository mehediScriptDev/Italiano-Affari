"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  navContainer: { backgroundColor: "white", padding: "15px 16px", borderBottom: "1px solid #ddd" },
  navList: { display: "flex", gap: "20px", listStyle: "none", margin: 0, padding: 0 },
  navItem: { position: "relative" },
  navLink: { textDecoration: "none", fontSize: "14px", color: "#333", fontWeight: "500", padding: "8px 12px", borderRadius: "0px", transition: "background 0.2s" },
  activeLink: { borderBottom: "2px solid black", color: "#000", fontWeight: "bold" },
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Statistiche" },
  { href: "/agent-management", label: "Gestione Agenti" },
  { href: "/orders", label: "Ordini / Report" },
  { href: "/contacts", label: "Contatti" },
  { href: "/wallet", label: "Portafoglio" },
];

export default function NavPartner() {
  const pathname = usePathname();

  return (
    <nav style={styles.navContainer}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <ul style={styles.navList}>
          {navLinks.map(({ href, label }) => (
            <li key={href} style={styles.navItem}>
              <Link href={href} style={{ ...styles.navLink, ...(pathname === href ? styles.activeLink : {}) }}>
                {label}
              </Link>
            </li>
          ))}
          <li style={styles.navItem}>
            <a
              href="https://contents.psicopatici.com/"
              style={styles.navLink}
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
