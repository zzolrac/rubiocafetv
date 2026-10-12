import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Coffee,
  LayoutDashboard,
  Building2,
  Store,
  Tag,
  MonitorPlay,
  MessageSquareWarning,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { useMasterKeyStore } from '../store/masterKeyStore';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lock = useMasterKeyStore((s) => s.lock);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-6 py-3 text-base font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Coffee className="text-[#E9967A]" size={40} />
          <h1 className="text-2xl font-bold text-gray-900">RubioCafé TV</h1>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          aria-label="Cerrar menú"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        <NavLink to="/" className={navLinkClass} onClick={() => setIsOpen(false)}>
          <LayoutDashboard size={22} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/locations" className={navLinkClass} onClick={() => setIsOpen(false)}>
          <Building2 size={22} />
          <span>Sucursales</span>
        </NavLink>

        <NavLink to="/screens" className={navLinkClass} onClick={() => setIsOpen(false)}>
          <MonitorPlay size={22} />
          <span>Pantallas</span>
        </NavLink>

        <NavLink to="/products" className={navLinkClass} onClick={() => setIsOpen(false)}>
          <Store size={22} />
          <span>Productos</span>
        </NavLink>

        <NavLink to="/promotions" className={navLinkClass} onClick={() => setIsOpen(false)}>
          <Tag size={22} />
          <span>Promociones</span>
        </NavLink>

        <NavLink to="/suggestions" className={navLinkClass} onClick={() => setIsOpen(false)}>
          <MessageSquareWarning size={22} />
          <span>Sugerencias</span>
        </NavLink>
      </nav>

      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={() => {
            lock();
            setIsOpen(false);
          }}
          className="flex items-center gap-3 px-6 py-3 text-base font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors w-full"
        >
          <Lock size={22} />
          <span>Bloquear panel</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 flex-shrink-0 h-full flex flex-col">
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-600 hover:text-primary transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Coffee className="text-[#E9967A]" size={28} />
          <span className="text-lg font-bold text-gray-900">RubioCafé TV</span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};

export default Sidebar;
