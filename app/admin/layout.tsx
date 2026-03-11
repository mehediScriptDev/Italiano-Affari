// Root admin layout — no shell here so /admin/login remains bare.
// The shell is applied inside app/admin/(protected)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
