import React, { useState } from 'react';
import { 
  UserCheck, 
  Clock, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Play, 
  AlertCircle, 
  Coffee, 
  DollarSign, 
  Scissors, 
  Sparkles,
  FileText,
  User,
  Check
} from 'lucide-react';
import { salonDB } from '../../services/db';
import { Staff, Appointment, AppointmentStatus } from '../../types';

interface StaffPortalProps {
  selectedBranchId: string;
}

export const StaffPortal: React.FC<StaffPortalProps> = ({ selectedBranchId }) => {
  const allStaff = salonDB.getStaff(selectedBranchId);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(allStaff[0]?.id || '');
  const activeStaff = allStaff.find(s => s.id === selectedStaffId) || allStaff[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const allAppointments = salonDB.getAppointments(selectedBranchId);

  // Filter appointments for this stylist today
  const myTodayAppointments = allAppointments.filter(
    a => a.staffId === activeStaff.id && a.date === todayStr
  );

  const completedToday = myTodayAppointments.filter(a => a.status === 'completed');
  const inChairNow = myTodayAppointments.find(a => a.status === 'in_progress');
  const upcomingToday = myTodayAppointments.filter(a => a.status === 'confirmed' || a.status === 'checked_in');

  // Daily earnings calculation (Commission based on completed services)
  const totalServiceBilled = completedToday.reduce((sum, a) => sum + a.price, 0);
  const commissionEarned = Math.round(totalServiceBilled * activeStaff.commissionRate);

  // Active service notes
  const [activeNotes, setActiveNotes] = useState('');
  const [notesSavedMsg, setNotesSavedMsg] = useState(false);

  const handleStatusChange = (aptId: string, status: AppointmentStatus) => {
    salonDB.updateAppointmentStatus(aptId, status);
  };

  const handleSaveFormulaNotes = () => {
    setNotesSavedMsg(true);
    setTimeout(() => setNotesSavedMsg(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans-clean">
      {/* Top Header & Specialist Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
            <span>Stylist Workspace</span>
            <span>•</span>
            <span>Personal Chair Terminal</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
            Artist Schedule & Service Hub
          </h1>
        </div>

        {/* Specialist Switcher */}
        <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#EFE8DF] text-xs">
          <span className="text-stone-500 font-medium pl-1">Acting as:</span>
          <select
            value={activeStaff.id}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="p-1.5 bg-white border border-[#EFE8DF] rounded-lg font-bold text-stone-900 focus:outline-none focus:border-[#C5A059]"
          >
            {allStaff.map(st => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STYLIST PROFILE & TODAY METRICS */}
      <div className="bg-white rounded-xl border border-[#EFE8DF] shadow-sm p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Profile Card */}
        <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#EFE8DF] pb-4 md:pb-0 md:pr-6">
          <div className="relative">
            <img
              src={activeStaff.avatar}
              alt={activeStaff.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#C5A059]"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[#987834] text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
              <span>{activeStaff.rating} Rating</span>
              <span className="text-stone-400 font-normal">({activeStaff.reviewsCount} reviews)</span>
            </div>
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">{activeStaff.name}</h2>
            <div className="text-xs text-stone-500">{activeStaff.role} • Shift: {activeStaff.shiftStart} – {activeStaff.shiftEnd}</div>
            <div className="text-[11px] text-[#987834] font-medium mt-1">
              Commission: {(activeStaff.commissionRate * 100)}% on services
            </div>
          </div>
        </div>

        {/* Shift Stats */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8DF]">
            <div className="text-stone-500 text-[10px] uppercase font-semibold">Today's In Chair</div>
            <div className="font-mono text-2xl font-bold text-stone-900 mt-1">
              {myTodayAppointments.length}
            </div>
            <div className="text-[10px] text-stone-400">Total Assigned</div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8DF]">
            <div className="text-stone-500 text-[10px] uppercase font-semibold">Completed</div>
            <div className="font-mono text-2xl font-bold text-emerald-700 mt-1">
              {completedToday.length}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Services Delivered</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-amber-800 text-[10px] uppercase font-semibold">Today's Earnings</div>
            <div className="font-mono text-2xl font-bold text-[#987834] mt-1">
              ₹{commissionEarned}
            </div>
            <div className="text-[10px] text-amber-700 font-medium">Commission Attributed</div>
          </div>
        </div>
      </div>

      {/* ACTIVE CLIENT IN-CHAIR HIGHLIGHT */}
      {inChairNow ? (
        <div className="bg-gradient-to-r from-[#2B1E19] to-[#3D281E] text-white p-6 rounded-2xl shadow-xl border border-[#C5A059]/40 space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E0C797]">
                Currently In Your Chair
              </span>
            </div>
            <div className="font-mono text-xs bg-black/30 px-2.5 py-1 rounded text-stone-300">
              Started at {inChairNow.startTime} • Duration: {inChairNow.durationMinutes} mins
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-2">
              <div className="text-xs text-stone-300">Patron:</div>
              <h3 className="font-serif-luxury text-2xl font-bold text-white">
                {inChairNow.customerName}
              </h3>
              <div className="text-xs text-[#E0C797] font-semibold">
                Service: {inChairNow.serviceName}
              </div>
              {inChairNow.specialInstructions && (
                <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 text-xs text-amber-200">
                  <strong>Guest Note:</strong> {inChairNow.specialInstructions}
                </div>
              )}
            </div>

            {/* In-Chair Quick Formula / Notes & Complete Action */}
            <div className="md:col-span-5 bg-black/20 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                Record Technical Formula / Notes
              </div>
              <input
                type="text"
                placeholder="e.g. Olaplex No. 1 15ml + 20 Vol bleach"
                value={activeNotes}
                onChange={(e) => setActiveNotes(e.target.value)}
                className="w-full p-2 bg-black/40 border border-white/20 rounded text-xs text-white placeholder-stone-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveFormulaNotes}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs text-stone-300 font-medium"
                >
                  {notesSavedMsg ? '✓ Saved' : 'Save Note'}
                </button>
                <button
                  onClick={() => handleStatusChange(inChairNow.id, 'completed')}
                  className="flex-1 py-1.5 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold rounded text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Service Completed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-[#987834]" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm">Chair is Currently Clear</div>
              <div className="text-stone-500">Ready for next walk-in or checked-in customer</div>
            </div>
          </div>
          {upcomingToday.length > 0 && (
            <div className="text-right">
              <span className="text-[11px] text-stone-400">Next Appointment:</span>
              <div className="font-bold text-stone-900">{upcomingToday[0].startTime} — {upcomingToday[0].customerName}</div>
            </div>
          )}
        </div>
      )}

      {/* TODAY'S SCHEDULE FOR THIS STYLIST */}
      <div className="bg-white rounded-xl border border-[#EFE8DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE8DF] flex justify-between items-center text-xs">
          <div className="font-bold text-stone-900">
            {activeStaff.name}'s Queue for Today ({myTodayAppointments.length} bookings)
          </div>
          <span className="text-stone-500">Click actions to manage your queue</span>
        </div>

        {myTodayAppointments.length === 0 ? (
          <div className="p-10 text-center text-stone-400 text-xs">
            No appointments scheduled for {activeStaff.name} today.
          </div>
        ) : (
          <div className="divide-y divide-[#EFE8DF]">
            {myTodayAppointments.map(apt => (
              <div key={apt.id} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs hover:bg-[#FAF7F2]">
                <div className="w-28">
                  <div className="font-mono font-bold text-stone-900 text-sm">{apt.startTime}</div>
                  <div className="text-[10px] text-stone-400">ends {apt.endTime}</div>
                </div>

                <div className="w-44">
                  <div className="font-bold text-stone-900 text-sm">{apt.customerName}</div>
                  <div className="text-stone-500 text-[11px]">{apt.customerPhone}</div>
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-stone-900">{apt.serviceName}</div>
                  <div className="text-[11px] text-stone-500">{apt.durationMinutes} minutes</div>
                  {apt.specialInstructions && (
                    <div className="text-[10px] text-amber-700 italic">"{apt.specialInstructions}"</div>
                  )}
                </div>

                <div className="w-28 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    apt.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : apt.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : apt.status === 'checked_in'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {apt.status === 'checked_in' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'in_progress')}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Start Service
                    </button>
                  )}

                  {apt.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'completed')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Finish
                    </button>
                  )}

                  {apt.status === 'completed' && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Service Delivered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
