import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WDS Admin",
  robots: { index: false, follow: false },
};

export default function AdminBaseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">{children}</div>
  );
}
