"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunity } from "@/components/community-context";

const DashboardSidebar = ({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) => {
  const pathname = usePathname();
  const { communities, selected, setSelected, loading } = useCommunity();

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navigation = [
    {
      href: "/communities",
      name: "Communities",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      ),
    },
    {
      href: "/members",
      name: "Members",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
    {
      href: "/analytics",
      name: "Analytics",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      ),
    },
    {
      href: "/matches",
      name: "Matches",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
    },
  ];

  const navsFooter = [
    {
      href: "/settings",
      name: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (onMobileClose) onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 sm:hidden"
          onClick={onMobileClose}
        />
      )}
      <nav className={`fixed top-0 left-0 w-72 h-full border-r border-border bg-warm sm:w-80 z-40 transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}>
        <div className="flex flex-col h-full px-4">
          {/* Community switcher */}
          <div className="h-20 flex items-center pl-2" ref={pickerRef}>
            <div className="w-full relative">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="w-full flex items-center gap-x-3 rounded-lg p-2 hover:bg-cream transition"
              >
                <div className="w-9 h-9 rounded-lg bg-gold-pale flex items-center justify-center text-sm font-semibold text-gold shrink-0">
                  {selected?.name?.[0] ?? "K"}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="block text-sm font-semibold text-ink truncate">
                    {loading ? "Loading..." : selected?.name ?? "Select community"}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-ink-3 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {pickerOpen && communities.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl bg-warm shadow-lg border border-border text-sm overflow-hidden">
                  {communities.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelected(c);
                        setPickerOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition ${
                        selected?.id === c.id
                          ? "bg-gold-pale text-ink"
                          : "text-ink-2 hover:bg-cream"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-gold-pale flex items-center justify-center text-xs font-semibold text-gold shrink-0">
                        {c.name[0]}
                      </div>
                      <span className="truncate font-medium">{c.name}</span>
                      {selected?.id === c.id && (
                        <svg className="w-4 h-4 text-gold ml-auto shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="overflow-auto">
            <ul className="text-sm font-medium flex-1">
              {navigation.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-2 p-2 rounded-lg duration-150 ${
                      pathname?.startsWith(item.href)
                        ? "bg-gold-pale text-ink"
                        : "text-ink-2 hover:bg-cream active:bg-gold-pale"
                    }`}
                  >
                    <div className={pathname?.startsWith(item.href) ? "text-gold" : "text-ink-3"}>
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-2 mt-2 border-t border-border-subtle">
              <ul className="text-sm font-medium">
                {navsFooter.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-x-2 p-2 rounded-lg duration-150 ${
                        pathname?.startsWith(item.href)
                          ? "bg-gold-pale text-ink"
                          : "text-ink-2 hover:bg-cream active:bg-gold-pale"
                      }`}
                    >
                      <div className={pathname?.startsWith(item.href) ? "text-gold" : "text-ink-3"}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default DashboardSidebar;
