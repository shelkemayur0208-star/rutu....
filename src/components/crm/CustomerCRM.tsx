import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Crown, 
  Star, 
  Calendar, 
  Phone, 
  Mail, 
  Heart, 
  Clock, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  X,
  CreditCard
} from 'lucide-react';
import { salonDB } from '../../services/db';
import { Customer, CustomerTier, Appointment } from '../../types';

interface CustomerCRMProps {
  selectedBranchId: string;
  onBookForCustomer: (customer: Customer) => void;
  onOpenPOSForCustomer: (customer: Customer) => void;
}

export const CustomerCRM: React.FC<CustomerCRMProps> = ({
  selectedBranchId,
  onBookForCustomer,
  onOpenPOSForCustomer,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const allCustomers = salonDB.getCustomers(selectedBranchId);
  const allAppointments = salonDB.getAppointments(selectedBranchId);

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAllergies, setNewCustAllergies] = useState('');
  const [newCustDrink, setNewCustDrink] = useState('');

  // Loyalty Points Quick Adjust
  const [pointsSuccessMsg, setPointsSuccessMsg] = useState<string | null>(null);

  const filteredCustomers = allCustomers.filter(c => {
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'VIP Platinum':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-[#987834] border border-[#C5A059]/40 flex items-center gap-1 w-fit">
            <Crown className="w-3 h-3 fill-[#C5A059]" /> VIP Platinum
          </span>
        );
      case 'Gold':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300 flex items-center gap-1 w-fit">
            <Star className="w-3 h-3 fill-yellow-600" /> Gold
          </span>
        );
      case 'Silver':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 w-fit">
            Silver
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 w-fit">
            Bronze
          </span>
        );
    }
  };

  const handleCreateNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    salonDB.createCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim(),
      branchId: selectedBranchId,
      preferences: {
        allergyNotes: newCustAllergies.trim() || undefined,
        drinkPreference: newCustDrink.trim() || undefined
      }
    });

    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAllergies('');
    setNewCustDrink('');
    setIsNewCustModalOpen(false);
  };

  const handleAwardPoints = (cust: Customer, amount: number) => {
    cust.loyaltyPoints += amount;
    salonDB.subscribe(() => {})(); // force notify
    setPointsSuccessMsg(`Awarded ${amount} loyalty points to ${cust.name}! New balance: ${cust.loyaltyPoints}`);
    setTimeout(() => setPointsSuccessMsg(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans-clean">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
            <span>Guest Relations & CRM</span>
            <span>•</span>
            <span>{currentBranch.city} Records</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
            Client Directory & Loyalty Engine
          </h1>
        </div>

        <button
          onClick={() => setIsNewCustModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs shadow-sm transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Add New Customer</span>
        </button>
      </div>

      {pointsSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <span>{pointsSuccessMsg}</span>
          <button onClick={() => setPointsSuccessMsg(null)}>✕</button>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Filter by Loyalty Tier:</span>
          <div className="flex gap-1">
            {['all', 'VIP Platinum', 'Gold', 'Silver', 'Bronze'].map(tier => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                  tierFilter === tier
                    ? 'bg-[#2B1E19] text-[#E0C797] font-semibold'
                    : 'bg-[#FAF7F2] text-stone-700 hover:border-stone-400 border border-[#EFE8DF]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* CUSTOMER DIRECTORY TABLE */}
      <div className="bg-white rounded-xl border border-[#EFE8DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE8DF] flex justify-between items-center text-xs">
          <span className="font-bold text-stone-900">Registered Patrons ({filteredCustomers.length})</span>
          <span className="text-stone-500">Click any patron to open detailed profile drawer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Patron Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Tier Status</th>
                <th className="p-3 text-center">Visits</th>
                <th className="p-3 text-right">Lifetime Spend</th>
                <th className="p-3 text-center">Loyalty Points</th>
                <th className="p-3 text-right">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DF]">
              {filteredCustomers.map(cust => (
                <tr
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className="hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                >
                  <td className="p-3 flex items-center gap-2.5">
                    {cust.avatar ? (
                      <img src={cust.avatar} alt={cust.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs">
                        {cust.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-stone-900">{cust.name}</div>
                      {cust.preferences.allergyNotes && (
                        <div className="text-[10px] text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Allergy Alert
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="font-mono text-stone-900">{cust.phone}</div>
                    <div className="text-stone-400 text-[10px]">{cust.email || 'No email registered'}</div>
                  </td>

                  <td className="p-3">
                    {getTierBadge(cust.tier)}
                  </td>

                  <td className="p-3 text-center font-mono font-semibold">
                    {cust.totalVisits}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-stone-900">
                    ₹{cust.totalSpent.toLocaleString('en-IN')}
                  </td>

                  <td className="p-3 text-center font-mono font-bold text-[#987834]">
                    {cust.loyaltyPoints} pts
                  </td>

                  <td className="p-3 text-right text-stone-600 font-mono text-[11px]">
                    {cust.lastVisitDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER PROFILE DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DF] mb-4">
                <div className="flex items-center gap-3">
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#2B1E19] text-[#E0C797] flex items-center justify-center font-bold text-base">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">{selectedCustomer.name}</h3>
                    <div>{getTierBadge(selectedCustomer.tier)}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-stone-400 hover:text-stone-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DF] text-center text-xs mb-4">
                <div>
                  <div className="text-[10px] text-stone-500 uppercase">Visits</div>
                  <div className="font-mono font-bold text-base text-stone-900">{selectedCustomer.totalVisits}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 uppercase">Total Spent</div>
                  <div className="font-mono font-bold text-base text-stone-900">₹{selectedCustomer.totalSpent.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 uppercase">Loyalty</div>
                  <div className="font-mono font-bold text-base text-[#987834]">{selectedCustomer.loyaltyPoints} pts</div>
                </div>
              </div>

              {/* Quick Award Points */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between items-center font-semibold text-amber-900">
                  <span>Loyalty Rewards Program</span>
                  <span className="text-[10px] text-amber-700">100 pts = ₹100 discount</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAwardPoints(selectedCustomer, 50)}
                    className="flex-1 py-1 bg-white border border-amber-300 rounded font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    +50 Bonus Pts
                  </button>
                  <button
                    onClick={() => handleAwardPoints(selectedCustomer, 100)}
                    className="flex-1 py-1 bg-white border border-amber-300 rounded font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    +100 Bonus Pts
                  </button>
                </div>
              </div>

              {/* Personal Preferences & Allergies */}
              <div className="space-y-3 text-xs mb-4">
                <div className="font-bold text-stone-800 text-xs">Customer Dossier & Preferences</div>

                <div className="p-3 bg-stone-50 rounded-lg space-y-2 border border-stone-200">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-semibold">Phone</span>
                    <div className="font-mono font-bold text-stone-900">{selectedCustomer.phone}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-semibold">Email</span>
                    <div className="text-stone-700">{selectedCustomer.email || 'None'}</div>
                  </div>
                  {selectedCustomer.preferences.drinkPreference && (
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-semibold">Beverage Preference</span>
                      <div className="text-stone-900 font-medium">☕ {selectedCustomer.preferences.drinkPreference}</div>
                    </div>
                  )}
                  {selectedCustomer.preferences.allergyNotes && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px]">
                      <strong>⚠️ Allergy & Consultation Note:</strong> {selectedCustomer.preferences.allergyNotes}
                    </div>
                  )}
                  {selectedCustomer.preferences.consultationNotes && (
                    <div className="text-stone-600 text-[11px]">
                      <strong>Styling Notes:</strong> {selectedCustomer.preferences.consultationNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Past Appointment History */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-stone-800">Recent Appointments</div>
                {allAppointments.filter(a => a.customerPhone === selectedCustomer.phone).length === 0 ? (
                  <div className="text-stone-400 text-[11px]">No previous appointments recorded.</div>
                ) : (
                  allAppointments
                    .filter(a => a.customerPhone === selectedCustomer.phone)
                    .slice(0, 3)
                    .map(apt => (
                      <div key={apt.id} className="p-2.5 rounded-lg border border-[#EFE8DF] bg-[#FAF7F2] text-xs">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span>{apt.serviceName}</span>
                          <span>₹{apt.price}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 flex justify-between mt-1">
                          <span>With {apt.staffName}</span>
                          <span>{apt.date}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="pt-4 border-t border-[#EFE8DF] space-y-2">
              <button
                onClick={() => {
                  onBookForCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="w-full py-2 bg-[#2B1E19] hover:bg-[#3D281E] text-[#E0C797] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment for {selectedCustomer.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => {
                  onOpenPOSForCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="w-full py-2 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open POS Billing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CUSTOMER MODAL */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#EFE8DF] overflow-hidden flex flex-col">
            <div className="bg-[#1A110D] text-white px-6 py-4 flex items-center justify-between border-b border-[#362217]">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-semibold">CRM Database</span>
                <h3 className="font-serif-luxury text-base text-white font-semibold">Add New Customer</h3>
              </div>
              <button onClick={() => setIsNewCustModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCustomer} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Natasha Kapoor"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98200 11229"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="natasha@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Beverage Preference</label>
                <input
                  type="text"
                  placeholder="e.g. Black Americano, Jasmine Green Tea"
                  value={newCustDrink}
                  onChange={(e) => setNewCustDrink(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Allergies / Scalp Sensitivities</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ammonia sensitivity, eczema..."
                  value={newCustAllergies}
                  onChange={(e) => setNewCustAllergies(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#EFE8DF]">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold rounded-lg text-xs shadow-md"
                >
                  Create Patron Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
