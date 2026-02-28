"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, icons, type MenuItem } from "@/lib/data/menu";
import { closeMobileMenu } from "@/lib/utils/toggle-mobile-menu";

export default function MobileMenu() {
  const pathname = usePathname();
  const [activeParent1, setActiveParent1] = useState(-1);
  const [activeParent2, setActiveParent2] = useState(-1);
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current?.contains(event.target as Node) &&
        elementRef.current &&
        !elementRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  const isMenuActive = (menu: MenuItem): boolean => {
    if (menu.href && pathname.split("/")[1] === menu.href.split("/")[1]) return true;
    if (menu.subItems) {
      return menu.subItems.some(
        (el) =>
          (el.href && pathname.split("/")[1] === el.href.split("/")[1]) ||
          el.subItems?.some((elm) => elm.href && pathname.split("/")[1] === elm.href.split("/")[1])
      );
    }
    return false;
  };

  return (
    <div
      ref={containerRef}
      id="uc-menu-panel"
      data-uc-offcanvas="overlay: true;"
      className="uc-offcanvas mobile-menu block"
      tabIndex={-1}
    >
      <div
        ref={elementRef}
        className="uc-offcanvas-bar bg-white text-dark dark:bg-gray-900 dark:text-white uc-offcanvas-bar-animation uc-offcanvas-slide max-w-219"
        role="dialog"
        aria-modal="true"
      >
        <header className="uc-offcanvas-header hstack justify-between items-center pb-2 bg-white dark:bg-gray-900">
          <div className="uc-logo">
            <Link href="/" className="h5 text-none text-gray-900 dark:text-white">
              <img alt="Logo" src="https://cdn.psicopaticiservice.com/cropped-psi-v1-black.png" width="180" height="180" />
            </Link>
          </div>
          <button
            className="uc-offcanvas-close rtl:end-auto rtl:inset-s-0 m-1 mt-2 icon-3 btn border-0 dark:text-white dark:text-opacity-50 hover:text-primary hover:rotate-90 duration-150 transition-all"
            type="button"
            onClick={closeMobileMenu}
          >
            <i className="unicon-close" />
          </button>
        </header>
        <div className="panel">
          <form onSubmit={(e) => e.preventDefault()} className="form-icon-group vstack gap-1 mb-2 uc-sticky">
            <input type="text" className="form-control form-control-sm fs-7 rounded-default" placeholder="Search.." />
            <span className="form-icon text-gray"><i className="unicon-search icon-1" /></span>
          </form>
          <ul className="nav-y gap-1 font-medium text-sm uc-nav" data-uc-nav="">
            {menuItems.map((item, index) => (
              <li key={index} className={`${item.subItems ? "uc-parent" : ""} ${activeParent1 === index ? "active" : ""}`}>
                {item.href ? (
                  <Link className={isMenuActive(item) ? "menuActive" : ""} href={item.href}>{item.label}</Link>
                ) : (
                  <>
                    <a className={isMenuActive(item) ? "menuActive" : ""} onClick={() => setActiveParent1((pre) => (pre === index ? -1 : index))}>{item.label}</a>
                    {item.subItems && (
                      <ul className={`uc-nav-sub ${activeParent1 === index ? "active" : ""}`}>
                        {item.subItems.map((subItem, index2) => (
                          <li key={index2} className={`${!subItem.href ? "uc-parent" : ""} ${activeParent2 === index2 ? "active" : ""}`}>
                            {subItem.href ? (
                              <Link className={isMenuActive(subItem) ? "menuActive" : ""} href={subItem.href}>{subItem.label}</Link>
                            ) : (
                              <>
                                <a className={isMenuActive(subItem) ? "menuActive" : ""} onClick={() => setActiveParent2((pre) => (pre === index2 ? -1 : index2))}>{subItem.label}</a>
                                {subItem.subItems && (
                                  <ul className={`uc-nav-sub ${activeParent2 === index2 ? "active" : ""}`}>
                                    {subItem.subItems.map((sub, index3) =>
                                      sub.href ? (
                                        <li key={index3}><Link className={isMenuActive(sub) ? "menuActive" : ""} href={sub.href}>{sub.label}</Link></li>
                                      ) : null
                                    )}
                                  </ul>
                                )}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          <ul className="social-icons nav-x mt-4">
            <li>
              {icons.map((icon, index) => (
                <a key={index} href={icon.href}><i className={icon.iconClass} /></a>
              ))}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
