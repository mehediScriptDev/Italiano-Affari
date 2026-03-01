"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Statistiche" },
  { href: "/agent-management", label: "Gestione Agenti" },
  { href: "/orders", label: "Ordini / Report" },
  { href: "/contacts", label: "Contatti" },
  { href: "/wallet", label: "Portafoglio" },
];

const styles: Record<string, CSSProperties> = {
  navContainer: {
    backgroundColor: "white",
    padding: "0 16px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  navList: {
    display: "flex",
    gap: "4px",
    listStyle: "none",
    margin: 0,
    padding: 0,
    height: "48px",
    alignItems: "center",
  },
  navItem: {
    position: "relative",
  },
  navLink: {
    textDecoration: "none",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 500,
    padding: "6px 14px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "inline-block",
    letterSpacing: "0.1px",
  },
  activeLink: {
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: 600,
  },
  hoverStyle: {
    backgroundColor: "#f6f8fb",
  },
};

export default function NavPartner() {
  const pathname = usePathname();

  return (
    <nav className="nav-container" style={styles.navContainer}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <ul className="nav-list" style={styles.navList}>
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href} style={styles.navItem}>
                <Link
                  href={href}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.activeLink : {}),
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
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
