export function openMobileMenu() {
  const el = document.getElementById("uc-menu-panel");
  if (el) {
    el.classList.add("uc-offcanvas-overlay", "uc-open");
  }
}

export function closeMobileMenu() {
  const el = document.getElementById("uc-menu-panel");
  if (el) {
    el.classList.remove("uc-offcanvas-overlay", "uc-open");
  }
}
