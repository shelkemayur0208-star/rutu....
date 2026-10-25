import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Filter, 
  Search, 
  User, 
  Scissors, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Phone, 
  Share2, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2
} from 'lucide-react';
import { salonDB } from '../../services/db';
import { Appointment, AppointmentStatus, Service, Staff } from '../../types';

interface AppointmentManagerProps {
  selectedBranchId: string;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  onOpenPOSForAppointment: (apt: Appointment) => void;
}

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  selectedBranchId,
  isCreateModalOpen,
  setIsCreateModalOpen,
  onOpenPOSForAppointment,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const allAppointments = salonDB.getAppointments(selectedBranchId);
  const allServices = salonDB.getServices();
  const allStaff = salonDB.getStaff(selectedBranchId);
  const allCustomers = salonDB.getCustomers(selectedBranchId);

  // View state
  const [activeView, setActiveView] = useState<'day' | 'week' | 'list'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Appointment Details Drawer
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // New Appointment Form State
  const [formCustName, setFormCustName] = useState('');
  const [formCustPhone, setFormCustPhone] = useState('');
  const [formServiceId, setFormServiceId] = useState(allServices[0]?.id || '');
  const [formStaffId, setFormStaffId] = useState(allStaff[0]?.id || '');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState('11:00');
  const [formSource, setFormSource] = useState<'phone' | 'walk_in' | 'website'>('walk_in');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Reschedule Form State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(selectedDate);
  const [rescheduleTime, setRescheduleTime] = useState('12:00');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // WhatsApp simulation modal
  const [notificationSentMsg, setNotificationSentMsg] = useState<string | null>(null);

  // Filter appointments
  const filteredAppointments = allAppointments.filter(apt => {
    const matchesStaff = staffFilter === 'all' || apt.staffId === staffFilter;
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch = apt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeView === 'day') {
      return matchesStaff && matchesStatus && matchesSearch && apt.date === selectedDate;
    }
    return matchesStaff && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'checked_in':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">Checked In</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">In Chair / In Progress</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">Cancelled</span>;
      case 'no_show':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-700">No Show</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-800">Booked</span>;
    }
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName.trim() || !formCustPhone.trim()) {
      setFormError('Please enter customer name and phone');
      return;
    }

    const res = salonDB.createAppointment({
      branchId: selectedBranchId,
      customerName: formCustName.trim(),
      customerPhone: formCustPhone.trim(),
      serviceId: formServiceId,
      staffId: formStaffId,
      date: formDate,
      startTime: formTime,
      specialInstructions: formNotes.trim() || undefined,
      bookingSource: formSource
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to schedule appointment');
      return;
    }

    setFormCustName('');
    setFormCustPhone('');
    setFormNotes('');
    setFormError(null);
    setIsCreateModalOpen(false);
  };

  const handleUpdateStatus = (aptId: string, newStatus: AppointmentStatus) => {
    salonDB.updateAppointmentStatus(aptId, newStatus);
    if (selectedApt && selectedApt.id === aptId) {
      setSelectedApt({ ...selectedApt, status: newStatus });
    }
  };

  const handleReschedule = () => {
    if (!selectedApt) return;
    const res = salonDB.rescheduleAppointment(selectedApt.id, rescheduleDate, rescheduleTime);
    if (!res.success) {
      setRescheduleError(res.error || 'Conflict detected');
      return;
    }
    setIsRescheduling(false);
    setSelectedApt({
      ...selectedApt,
      date: rescheduleDate,
      startTime: rescheduleTime
    });
    setRescheduleError(null);
  };

  const handleSendReminder = (apt: Appointment) => {
    setNotificationSentMsg(`Simulated WhatsApp reminder sent to ${apt.customerPhone}: "Hi ${apt.customerName}, your appointment for ${apt.serviceName} at AuraLuxe is confirmed on ${apt.date} at ${apt.startTime}."`);
    setTimeout(() => setNotificationSentMsg(null), 5000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans-clean">
      {/* Top Header & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
            <span>Appointment Central</span>
            <span>•</span>
            <span>{currentBranch.city} Branch</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
            Salon Calendar & Bookings
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Day / Week / List Switcher */}
          <div className="bg-[#FAF7F2] p-1 rounded-lg border border-[#EFE8DF] flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setActiveView('day')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'day' ? 'bg-[#2B1E19] text-[#E0C797] font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === 'list' ? 'bg-[#2B1E19] text-[#E0C797] font-semibold' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              All Bookings List
            </button>
          </div>

          <button
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Appointment</span>
          </button>
        </div>
      </div>

      {notificationSentMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>{notificationSentMsg}</span>
          </div>
          <button onClick={() => setNotificationSentMsg(null)} className="text-emerald-700 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* FILTER BAR & DATE PICKER */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EFE8DF] px-2.5 py-1.5 rounded-lg">
            <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-stone-900 font-semibold focus:outline-none"
            />
          </div>

          {/* Quick Date Buttons */}
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium"
          >
            Today
          </button>

          {/* Staff Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EFE8DF] px-2.5 py-1.5 rounded-lg">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-transparent text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Specialists</option>
              {allStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#EFE8DF] px-2.5 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search client, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* APPOINTMENT GRID / TABLE */}
      <div className="bg-white rounded-xl border border-[#EFE8DF] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFE8DF] flex items-center justify-between text-xs">
          <div className="font-bold text-stone-800">
            Showing {filteredAppointments.length} appointment(s) for {activeView === 'day' ? selectedDate : 'all recorded dates'}
          </div>
          <div className="text-stone-500">
            Click any row to view full client profile, reschedule or bill
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs space-y-2">
            <CalendarIcon className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No appointments match your filters.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[#987834] font-semibold hover:underline"
            >
              + Create New Booking
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#EFE8DF] overflow-x-auto">
            {filteredAppointments.map(apt => (
              <div
                key={apt.id}
                onClick={() => setSelectedApt(apt)}
                className="p-4 hover:bg-[#FAF7F2] cursor-pointer transition-colors flex items-center justify-between gap-4 text-xs min-w-[750px]"
              >
                {/* Time & Reference */}
                <div className="w-28 flex-shrink-0">
                  <div className="font-mono font-bold text-stone-900 text-sm">{apt.startTime}</div>
                  <div className="text-[11px] text-stone-400">until {apt.endTime}</div>
                  <div className="font-mono text-[10px] text-[#987834] font-semibold">{apt.bookingCode}</div>
                </div>

                {/* Client Information */}
                <div className="w-48 flex-shrink-0">
                  <div className="font-bold text-stone-900 text-sm">{apt.customerName}</div>
                  <div className="text-stone-500 text-[11px]">{apt.customerPhone}</div>
                  <div className="text-[10px] text-stone-400 capitalize">Source: {apt.bookingSource}</div>
                </div>

                {/* Service & Specialist */}
                <div className="flex-1">
                  <div className="font-semibold text-stone-900">{apt.serviceName}</div>
                  <div className="text-stone-500 text-[11px]">
                    Specialist: <strong className="text-stone-700">{apt.staffName}</strong> • {apt.durationMinutes} mins
                  </div>
                  {apt.specialInstructions && (
                    <div className="text-[10px] text-amber-700 mt-0.5 truncate max-w-sm">
                      Note: {apt.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="w-24 text-right flex-shrink-0">
                  <div className="font-bold text-stone-900 text-sm">₹{apt.price}</div>
                  <div className="text-[10px] text-stone-400">Date: {apt.date}</div>
                </div>

                {/* Status Badge */}
                <div className="w-28 text-center flex-shrink-0">
                  {getStatusBadge(apt.status)}
                </div>

                {/* Quick Action Button */}
                <div className="w-32 flex items-center justify-end gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {apt.status === 'completed' && !apt.invoiceId ? (
                    <button
                      onClick={() => onOpenPOSForAppointment(apt)}
                      className="px-2.5 py-1 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold rounded text-[11px]"
                    >
                      Bill in POS
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedApt(apt)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-medium"
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* APPOINTMENT DETAILS & ACTIONS DRAWER */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DF] mb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#987834] font-bold">{selectedApt.bookingCode}</span>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">Appointment Details</h3>
                </div>
                <button onClick={() => setSelectedApt(null)} className="text-stone-400 hover:text-stone-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status progression bar */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE8DF] mb-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Current Status:</span>
                  <div>{getStatusBadge(selectedApt.status)}</div>
                </div>

                <div className="text-[11px] font-semibold text-stone-700">Update Booking Status:</div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    onClick={() => handleUpdateStatus(selectedApt.id, 'confirmed')}
                    className={`py-1 rounded border ${selectedApt.status === 'confirmed' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-stone-700'}`}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApt.id, 'checked_in')}
                    className={`py-1 rounded border ${selectedApt.status === 'checked_in' ? 'bg-purple-600 text-white font-bold' : 'bg-white text-stone-700'}`}
                  >
                    Checked In
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApt.id, 'in_progress')}
                    className={`py-1 rounded border ${selectedApt.status === 'in_progress' ? 'bg-amber-600 text-white font-bold' : 'bg-white text-stone-700'}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApt.id, 'completed')}
                    className={`py-1 rounded border ${selectedApt.status === 'completed' ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-stone-700'}`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApt.id, 'no_show')}
                    className={`py-1 rounded border ${selectedApt.status === 'no_show' ? 'bg-stone-600 text-white font-bold' : 'bg-white text-stone-700'}`}
                  >
                    No Show
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApt.id, 'cancelled')}
                    className={`py-1 rounded border ${selectedApt.status === 'cancelled' ? 'bg-rose-600 text-white font-bold' : 'bg-white text-stone-700'}`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              {/* Service & Client summary */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-semibold">Customer</div>
                  <div className="font-bold text-stone-900 text-sm">{selectedApt.customerName}</div>
                  <div className="text-stone-600">{selectedApt.customerPhone}</div>
                </div>

                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-semibold">Treatment</div>
                  <div className="font-bold text-stone-900">{selectedApt.serviceName}</div>
                  <div className="text-stone-600">Assigned Artist: {selectedApt.staffName}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg">
                  <div>
                    <div className="text-stone-400 text-[10px]">Date</div>
                    <div className="font-bold text-stone-900">{selectedApt.date}</div>
                  </div>
                  <div>
                    <div className="text-stone-400 text-[10px]">Time Slot</div>
                    <div className="font-bold text-stone-900">{selectedApt.startTime} – {selectedApt.endTime}</div>
                  </div>
                  <div>
                    <div className="text-stone-400 text-[10px]">Price</div>
                    <div className="font-bold text-stone-900">₹{selectedApt.price}</div>
                  </div>
                  <div>
                    <div className="text-stone-400 text-[10px]">Duration</div>
                    <div className="font-bold text-stone-900">{selectedApt.durationMinutes} minutes</div>
                  </div>
                </div>

                {selectedApt.specialInstructions && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                    <span className="font-bold">Instructions:</span> {selectedApt.specialInstructions}
                  </div>
                )}

                {/* Reschedule Subsection */}
                <div className="pt-2 border-t border-[#EFE8DF]">
                  {!isRescheduling ? (
                    <button
                      onClick={() => {
                        setRescheduleDate(selectedApt.date);
                        setRescheduleTime(selectedApt.startTime);
                        setIsRescheduling(true);
                      }}
                      className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Reschedule Slot
                    </button>
                  ) : (
                    <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#EFE8DF] space-y-2">
                      <div className="font-bold text-stone-900 text-xs">Reschedule Booking</div>
                      {rescheduleError && (
                        <div className="text-rose-700 text-[11px] font-semibold">{rescheduleError}</div>
                      )}
                      <div>
                        <label className="text-[10px] text-stone-500">New Date</label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full p-1.5 border rounded text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500">New Start Time</label>
                        <input
                          type="time"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full p-1.5 border rounded text-xs bg-white"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleReschedule}
                          className="flex-1 py-1.5 bg-[#2B1E19] text-[#E0C797] font-bold rounded text-xs"
                        >
                          Save New Slot
                        </button>
                        <button
                          onClick={() => setIsRescheduling(false)}
                          className="px-3 py-1.5 bg-stone-200 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Reminder Button */}
                <button
                  onClick={() => handleSendReminder(selectedApt)}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Send WhatsApp Reminder</span>
                </button>
              </div>
            </div>

            {/* Bottom Invoicing Trigger */}
            <div className="pt-4 border-t border-[#EFE8DF] space-y-2">
              <button
                onClick={() => {
                  onOpenPOSForAppointment(selectedApt);
                  setSelectedApt(null);
                }}
                className="w-full py-2.5 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Open POS & Generate Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW APPOINTMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#EFE8DF] flex flex-col">
            <div className="bg-[#1A110D] text-white px-6 py-4 flex items-center justify-between border-b border-[#362217]">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-semibold">Front Desk Reception</span>
                <h3 className="font-serif-luxury text-lg text-white font-semibold">New Appointment Booking</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick autofill from existing customers */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Existing Customer (Optional)</label>
                <select
                  onChange={(e) => {
                    const c = allCustomers.find(cust => cust.id === e.target.value);
                    if (c) {
                      setFormCustName(c.name);
                      setFormCustPhone(c.phone);
                    }
                  }}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                >
                  <option value="">-- Choose registered customer or enter below --</option>
                  {allCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.tier}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Sharma"
                    value={formCustName}
                    onChange={(e) => setFormCustName(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98290 12345"
                    value={formCustPhone}
                    onChange={(e) => setFormCustPhone(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Treatment / Service</label>
                <select
                  value={formServiceId}
                  onChange={(e) => setFormServiceId(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                >
                  {allServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₹{s.price} ({s.durationMinutes}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assign Specialist</label>
                <select
                  value={formStaffId}
                  onChange={(e) => setFormStaffId(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                >
                  {allStaff.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Time Slot</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Booking Source</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as any)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                >
                  <option value="walk_in">Walk-in Client</option>
                  <option value="phone">Phone Call Reservation</option>
                  <option value="website">Website Portal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Special Notes / Consultation</label>
                <textarea
                  rows={2}
                  placeholder="Styling preferences, allergies..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#EFE8DF]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold rounded-lg text-xs shadow-md transition-all"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
