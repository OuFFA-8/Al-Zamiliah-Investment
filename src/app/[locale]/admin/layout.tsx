"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRTL = locale === "ar";

  const isLoginPage = pathname?.includes("/admin/login");

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push(`/${locale}/admin/login`);
      });
  }, [isLoginPage, locale, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f3f4f6",
        }}
      >
        <div className="loading-spinner" />
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
  };

  const navItems = [
    { href: `/${locale}/admin`, labelAr: "التحكم", labelEn: "Dashboard" },
    {
      href: `/${locale}/admin/projects/new`,
      labelAr: "إضافة مشروع جديد",
      labelEn: "Add New Project",
    },
    {
      href: `/${locale}/admin/projects`,
      labelAr: "إدارة المشاريع",
      labelEn: "Manage Projects",
    },
    {
      href: `/${locale}/admin/apartments`,
      labelAr: "أدارة الشقق والمباني",
      labelEn: "Apartments & Buildings",
    },
    {
      href: `/${locale}/admin/contacts`,
      labelAr: "طلبات التواصل",
      labelEn: "Contact Requests",
    },
    {
      href: `/${locale}/admin/statistics`,
      labelAr: "أحصائيات الموقع",
      labelEn: "Site Statistics",
    },
    {
      href: `/${locale}/admin/promotion`,
      labelAr: "ترويج للموقع",
      labelEn: "Site Promotion",
    },
    {
      href: `/${locale}/admin/content`,
      labelAr: "سياسات وخصوصية",
      labelEn: "Policies & Privacy",
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    // Exact match for dashboard
    if (href === `/${locale}/admin`) return pathname === href;
    // For /projects, don't match /projects/new or /projects/123/edit
    if (href === `/${locale}/admin/projects`) return pathname === href;
    // For /projects/new, exact match
    if (href === `/${locale}/admin/projects/new`) return pathname === href;
    // For apartments, also match sub-routes like /apartments/123
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-layout-v2" dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Navigation Bar */}
      <nav className="admin-topnav">
        <div className="admin-topnav-inner">
          <div className="admin-topnav-content">
            {/* Logo */}
            <div className="admin-topnav-logo">
              <Link href={`/${locale}`}>
                <Image
                  src="/images/logow.png"
                  alt="الزاملية"
                  width={80}
                  height={60}
                  style={{
                    height: "60px",
                    width: "auto",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                  }}
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="admin-topnav-links">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-topnav-link ${isActive(item.href) ? "active" : ""}`}
                >
                  {isRTL ? item.labelAr : item.labelEn}
                </Link>
              ))}

              {/* View website icon */}
              <Link
                href={`/${locale}`}
                target="_blank"
                className="admin-topnav-link"
                title={isRTL ? "عرض الموقع" : "View Website"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  style={{ width: "22px", height: "22px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z"
                  />
                </svg>
              </Link>
            </div>

            {/* User & Logout (Desktop) */}
            <div className="admin-topnav-user">
              {user && (
                <span className="admin-topnav-username">{user.name}</span>
              )}
              <button
                onClick={handleLogout}
                className="admin-topnav-logout"
                title={isRTL ? "تسجيل الخروج" : "Logout"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  style={{ width: "20px", height: "20px" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="admin-topnav-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                style={{ width: "24px", height: "24px" }}
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="admin-topnav-mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-topnav-mobile-link ${isActive(item.href) ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isRTL ? item.labelAr : item.labelEn}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="admin-topnav-mobile-link"
                style={{
                  color: "#ef4444",
                  border: "none",
                  background: "none",
                  textAlign: isRTL ? "right" : "left",
                  cursor: "pointer",
                }}
              >
                {isRTL ? "تسجيل الخروج" : "Logout"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="admin-main-v2">
        <div className="admin-main-container">{children}</div>
      </main>
    </div>
  );
}
