"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const navSections = [
  {
    label: "Principale",
    items: [
      { label: "Tableau de bord", href: "/dashbord/tableau", icon: LayoutDashboard },
    ],
  },
  {
    label: "Gestion",
    items: [
      { label: "Ventes", href: "/dashbord/ventes", icon: ShoppingCart },
      { label: "Produits", href: "/dashbord/produits", icon: Package },
      { label: "Offres & Promos", href: "/dashbord/offres", icon: TrendingUp },
      { label: "Clients", href: "/dashbord/clients", icon: Users },
    ],
  },
  {
    label: "Paramètres",
    items: [
      { label: "Configuration", href: "/dashbord/configuration", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [modalDeconnexion, setModalDeconnexion] = useState(false);

  return (
    <>
      <aside className="w-52 bg-[#064e3b] text-white flex flex-col p-3 flex-shrink-0 min-h-screen">
        {/* Logo */}
        <div className="flex items-center px-1 py-1 mb-0">
          <Image
            src="/logoo.png"
            alt="7anouty logo"
            width={170}
            height={40}
            className="rounded-md flex-shrink-0"
          />
        </div>

        {/* Nav sections */}
        <nav className="flex flex-col gap-1 flex-1">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 px-2.5 pt-2 pb-1">
                {section.label}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={25} strokeWidth={1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom user bar */}
        <div className="border-t border-white/10 pt-3 mt-2 flex items-center gap-1">
          <Link
            href="/dashbord/configuration"
            className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors min-w-0"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
              RK
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Ramy Kaci</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">gerant du supermaché</p>
            </div>
          </Link>

          <button
            onClick={() => setModalDeconnexion(true)}
            title="Se déconnecter"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
          >
            <LogOut size={25} strokeWidth={2} />
          </button>
        </div>
      </aside>

      {/* Modale de confirmation */}
      {modalDeconnexion && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
    
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
        <LogOut size={22} className="text-[#064e3b]" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">Déconnexion</h2>
        <p className="text-sm text-gray-400 mt-1">
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 pt-1">
      <button
        onClick={() => setModalDeconnexion(false)}
        className="text-sm font-medium text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
      >
        Annuler
      </button>
      <button
        onClick={() => router.push("/")}
        className="text-sm font-medium text-white bg-[#064e3b] rounded-xl py-2.5 hover:bg-[#065f46] transition-colors"
      >
        Se déconnecter
      </button>
    </div>

  </div>
</div>
      )}
    </>
  );
}