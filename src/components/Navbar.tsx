import React from 'react';
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  Users, 
  UserCheck, 
  Package, 
  Settings, 
  Globe, 
  MapPin, 
  RotateCcw,
  Sparkles,
  Bell
} from 'lucide-react';
import { salonDB } from '../services/db';

export type ActiveTab = 
  | 'website' 
  | 'dashboard' 
  | 'appointments' 
  | 'pos' 
  | 'crm' 
  | 'staff_portal' 
  | 'inventory' 
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedBranchId,
  setSelectedBranchId,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const handleResetData = () => {
    if (window.confirm('Reset all demo data to initial luxury salon state? Any newly created appointments will be refreshed to default.')) {
      salonDB.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1A110D] text-white border-b border-[#3D281E] shadow-xl">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#2C1D16]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#C5A059] font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AuraLuxe Salon OS</span>
            <span className="bg-[#C5A059]/20 text-[#E0C797] text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              Enterprise v2.4
            </span>
          </div>
          <span className="text-stone-500 hidden sm:inline">•</span>
          <span className="text-stone-400 hidden sm:inline">
            Unisex Luxury Salon & Spa SaaS Platform
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 bg-[#2B1E19] px-2.5 py-1 rounded-md border border-[#4A3226]">
            <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="text-stone-400">Branch:</span>
            <select 
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-[#E0C797] font-medium text-xs focus:outline-none cursor-pointer"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-[#241814] text-white">
                  {b.city} — {b.name.split('—')[1]?.trim() || b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetData}
            title="Reset database to seed records"
            className="flex items-center gap-1 text-stone-400 hover:text-[#C5A059] transition-colors py-0.5 px-2 rounded hover:bg-[#2B1E19]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <button 
            onClick={() => setActiveTab('website')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-98"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8C651E] flex items-center justify-center text-[#1A110D] font-bold shadow-md shadow-[#C5A059]/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-cinzel text-lg tracking-wider font-bold text-white group-hover:text-[#E0C797] transition-colors block leading-none">
                AURALUXE
              </span>
              <span className="text-[10px] tracking-widest text-[#C5A059] uppercase font-light">
                Salon & Spa Collective
              </span>
            </div>
          </button>

          {/* Navigation Links / View Switcher */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            <button
              onClick={() => setActiveTab('website')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'website'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Website</span>
            </button>

            <span className="text-[#3D281E] px-1 font-light">|</span>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'pos'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>POS / Billing</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'crm'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('staff_portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'staff_portal'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-[#C5A059] text-[#1A110D] shadow-sm font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-[#2B1E19]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
