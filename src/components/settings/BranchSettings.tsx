import React, { useState } from 'react';
import { 
  Settings, 
  MapPin, 
  Clock, 
  Bell, 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Smartphone, 
  Mail,
  Copy,
  Building
} from 'lucide-react';
import { salonDB } from '../../services/db';
import { SalonBranch } from '../../types';

interface BranchSettingsProps {
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
}

export const BranchSettings: React.FC<BranchSettingsProps> = ({
  selectedBranchId,
  setSelectedBranchId,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const [activeTab, setActiveTab] = useState<'branches' | 'notifications' | 'backup'>('branches');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportJSON = () => {
    const jsonStr = salonDB.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auraluxe-salon-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = salonDB.importJSON(content);
        if (success) {
          setImportStatus('Database successfully restored from backup!');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setImportStatus('Error: Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all demo data to seed luxury salon state? This will restore initial branches, appointments, and customers.')) {
      salonDB.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans-clean">
      {/* Header */}
      <div className="pb-4 border-b border-[#EFE8DF]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
          <span>System Administration</span>
          <span>•</span>
          <span>Global Configurations</span>
        </div>
        <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
          Salon Settings & Multi-Branch Control
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#EFE8DF] gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'branches' ? 'border-[#C5A059] text-[#987834]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Branch Locations & Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'notifications' ? 'border-[#C5A059] text-[#987834]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Automated Reminders (WhatsApp/SMS)</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'backup' ? 'border-[#C5A059] text-[#987834]' : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Database Backup & Restore</span>
        </button>
      </div>

      {/* TAB 1: MULTI-BRANCH */}
      {activeTab === 'branches' && (
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map(branch => {
              const isSelected = branch.id === selectedBranchId;
              return (
                <div
                  key={branch.id}
                  className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between ${
                    isSelected ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-md' : 'border-[#EFE8DF] shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-stone-900 text-sm">{branch.city} Studio</div>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A059] text-[#1A110D]">
                          ACTIVE
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedBranchId(branch.id)}
                          className="text-[11px] text-[#987834] font-semibold hover:underline"
                        >
                          Switch Here
                        </button>
                      )}
                    </div>

                    <div className="text-stone-700 font-medium">{branch.name}</div>
                    <div className="text-stone-500 text-[11px] leading-relaxed flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-[#F5EFEB] text-[11px] text-stone-600">
                      <div><strong>Phone:</strong> {branch.phone}</div>
                      <div><strong>Email:</strong> {branch.email}</div>
                      <div><strong>GSTIN:</strong> {branch.gstNumber}</div>
                      <div className="flex items-center gap-1 text-stone-700">
                        <Clock className="w-3 h-3 text-[#C5A059]" />
                        <span>Daily Hours: {branch.openingTime} – {branch.closingTime}</span>
                      </div>
                    </div>
                  </div>

                  {!isSelected && (
                    <div className="pt-4 mt-2">
                      <button
                        onClick={() => setSelectedBranchId(branch.id)}
                        className="w-full py-2 bg-[#FAF7F2] hover:bg-[#2B1E19] hover:text-[#E0C797] border border-[#EFE8DF] rounded-lg font-semibold transition-colors"
                      >
                        Set as Active Branch
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 text-xs">
          <p className="text-stone-600">
            AuraLuxe Salon OS automatically dispatches scheduled reminders to reduce no-shows. Preview current communication templates:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template 1 */}
            <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Instant WhatsApp Booking Confirmation
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Active
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EFE8DF] font-sans text-stone-800 text-[11px] leading-relaxed">
                "Hello <strong className="text-stone-900">&#123;&#123;customer_name&#125;&#125;</strong>! ✨ Your appointment for <strong className="text-stone-900">&#123;&#123;service_name&#125;&#125;</strong> with <strong className="text-stone-900">&#123;&#123;specialist_name&#125;&#125;</strong> at AuraLuxe Collective is confirmed for <strong className="text-stone-900">&#123;&#123;date&#125;&#125; at &#123;&#123;time&#125;&#125;</strong>. Reference: &#123;&#123;booking_code&#125;&#125;. Reply CANCEL if you need to reschedule."
              </div>
              <div className="text-[10px] text-stone-400">Trigger: Immediately upon customer online booking or front-desk entry.</div>
            </div>

            {/* Template 2 */}
            <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#987834]" />
                  2-Hour Prior Reminder SMS
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Active
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EFE8DF] font-sans text-stone-800 text-[11px] leading-relaxed">
                "Reminder: Your AuraLuxe salon appointment is scheduled today at <strong className="text-stone-900">&#123;&#123;time&#125;&#125;</strong>. We have reserved complimentary valet parking at our &#123;&#123;branch_city&#125;&#125; studio. See you soon!"
              </div>
              <div className="text-[10px] text-stone-400">Trigger: 120 minutes prior to appointment start time.</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & DATABASE CONTROL */}
      {activeTab === 'backup' && (
        <div className="space-y-6 text-xs">
          <div className="bg-white p-6 rounded-xl border border-[#EFE8DF] shadow-sm space-y-4">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Salon Database Continuity & Snapshots
              </h3>
              <p className="text-stone-600 mt-1">
                Download a complete JSON snapshot of all registered services, staff members, appointments, customer dossiers, inventory, and POS invoices.
              </p>
            </div>

            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg">
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Export Button */}
              <div className="p-4 rounded-xl border border-[#EFE8DF] bg-[#FAF7F2] space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#C5A059]" />
                  Export Data JSON
                </div>
                <p className="text-[11px] text-stone-500">
                  Save all current business records to a local file.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="w-full py-2 bg-[#2B1E19] text-[#E0C797] font-semibold rounded-lg hover:bg-[#3D281E]"
                >
                  Download Backup
                </button>
              </div>

              {/* Import Button */}
              <div className="p-4 rounded-xl border border-[#EFE8DF] bg-[#FAF7F2] space-y-2">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Restore from JSON
                </div>
                <p className="text-[11px] text-stone-500">
                  Upload an existing salon database snapshot.
                </p>
                <label className="block w-full py-2 bg-white border border-[#EFE8DF] text-stone-800 text-center font-semibold rounded-lg cursor-pointer hover:bg-stone-50">
                  Upload Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset to Seed Defaults */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
                <div className="font-bold text-rose-800 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  Reset Demo State
                </div>
                <p className="text-[11px] text-rose-700">
                  Restores initial realistic Jaipur/Delhi/Mumbai records.
                </p>
                <button
                  onClick={handleResetToDefault}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                >
                  Reset to Seed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
