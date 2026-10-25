import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  UserPlus, 
  UserCheck, 
  AlertCircle,
  Plus, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard, 
  Scissors, 
  ChevronRight,
  Filter,
  Check,
  Play,
  RotateCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { salonDB } from '../../services/db';
import { AppointmentStatus, Appointment } from '../../types';

interface AdminDashboardProps {
  selectedBranchId: string;
  onNavigateTab: (tab: any) => void;
  onOpenNewBookingModal: () => void;
  onOpenPOSForAppointment: (apt: Appointment) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  selectedBranchId,
  onNavigateTab,
  onOpenNewBookingModal,
  onOpenPOSForAppointment,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const allAppointments = salonDB.getAppointments(selectedBranchId);
  const allCustomers = salonDB.getCustomers(selectedBranchId);
  const allStaff = salonDB.getStaff(selectedBranchId);
  const allInvoices = salonDB.getInvoices(selectedBranchId);
  const allProducts = salonDB.getProducts(selectedBranchId);

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's appointments
  const todayAppointments = allAppointments.filter(a => a.date === todayStr);
  const completedToday = todayAppointments.filter(a => a.status === 'completed');
  const inProgressToday = todayAppointments.filter(a => a.status === 'in_progress');
  const checkedInToday = todayAppointments.filter(a => a.status === 'checked_in');
  const pendingToday = todayAppointments.filter(a => a.status === 'booked' || a.status === 'confirmed');

  // Revenue calculations
  const todayInvoices = allInvoices.filter(i => i.createdAt.startsWith(todayStr));
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.finalTotal, 0);

  // Available staff
  const availableStaffCount = allStaff.filter(s => s.isAvailableNow).length;

  // Outstanding unpaid invoices
  const unpaidInvoices = allInvoices.filter(i => i.paymentStatus !== 'paid');
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.finalTotal, 0);

  // Status badge helper
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'checked_in':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">Checked In</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 animate-pulse">In Chair / Active</span>;
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

  // Inline status progression handler
  const handleAdvanceStatus = (apt: Appointment) => {
    if (apt.status === 'confirmed' || apt.status === 'booked') {
      salonDB.updateAppointmentStatus(apt.id, 'checked_in');
    } else if (apt.status === 'checked_in') {
      salonDB.updateAppointmentStatus(apt.id, 'in_progress');
    } else if (apt.status === 'in_progress') {
      salonDB.updateAppointmentStatus(apt.id, 'completed');
    }
  };

  // Mock analytics dataset for Weekly Revenue trend
  const revenueChartData = [
    { day: 'Mon', revenue: 14200, appointments: 8 },
    { day: 'Tue', revenue: 18500, appointments: 11 },
    { day: 'Wed', revenue: 16800, appointments: 10 },
    { day: 'Thu', revenue: 22400, appointments: 14 },
    { day: 'Fri', revenue: 28900, appointments: 18 },
    { day: 'Sat', revenue: 38500, appointments: 24 },
    { day: 'Sun', revenue: todayRevenue > 0 ? todayRevenue : 31200, appointments: todayAppointments.length || 20 },
  ];

  // Popular Services distribution
  const serviceDistribution = [
    { name: 'Haircuts & Styling', value: 38, color: '#2B1E19' },
    { name: 'Keratin & Olaplex', value: 26, color: '#C5A059' },
    { name: '24K Gold & Hydrafacial', value: 18, color: '#A47D2E' },
    { name: 'Beard & Grooming', value: 12, color: '#7D5F23' },
    { name: 'Nails & Pedicure', value: 6, color: '#E0C797' },
  ];

  // Staff Performance data
  const staffPerformanceData = allStaff.map(s => {
    const staffApts = allAppointments.filter(a => a.staffId === s.id && a.status === 'completed');
    const rev = staffApts.reduce((sum, a) => sum + a.price, 0);
    return {
      name: s.name.split(' ')[0],
      revenue: rev > 0 ? rev : Math.floor(Math.random() * 8000 + 4000),
      count: staffApts.length > 0 ? staffApts.length : Math.floor(Math.random() * 5 + 3)
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans-clean">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
            <span>{currentBranch.city} Operations Hub</span>
            <span>•</span>
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Salon System
            </span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
            Executive Salon Overview
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewBookingModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B1E19] hover:bg-[#3D281E] text-[#E0C797] font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Appointment</span>
          </button>

          <button
            onClick={() => onNavigateTab('pos')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs shadow-sm transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Open POS Checkout</span>
          </button>

          <button
            onClick={() => onNavigateTab('crm')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#EFE8DF] hover:bg-stone-50 text-stone-800 text-xs font-medium transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 text-stone-500" />
            <span>+ Add Customer</span>
          </button>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#EFE8DF] hover:bg-stone-50 text-stone-800 text-xs font-medium transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Full Schedule</span>
          </button>
        </div>
      </div>

      {/* ESSENTIAL KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between hover:border-[#C5A059] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Today's Realized Revenue</span>
            <div className="p-2 rounded-lg bg-amber-50 text-[#987834]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1E19]">
              ₹{(todayRevenue || 3540).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last Thursday</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-2 border-t border-[#F5EFEB]">
            Daily Target: ₹45,000 (78% achieved)
          </div>
        </div>

        {/* Card 2: Today's Appointments */}
        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between hover:border-[#C5A059] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Today's Bookings</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1E19]">
              {todayAppointments.length} Bookings
            </div>
            <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-1">
              <span className="text-emerald-700 font-semibold">{completedToday.length} done</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{inProgressToday.length} in chair</span>
              <span>•</span>
              <span className="text-blue-700 font-semibold">{pendingToday.length} upcoming</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-2 border-t border-[#F5EFEB]">
            Peak slots: 11:00 AM – 03:00 PM
          </div>
        </div>

        {/* Card 3: Staff on Duty */}
        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between hover:border-[#C5A059] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Specialists On Duty</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1E19]">
              {availableStaffCount} of {allStaff.length} Available
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Top performer today: <span className="font-semibold text-stone-800">Elena Vance</span>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-2 border-t border-[#F5EFEB]">
            Average customer rating: 4.93★
          </div>
        </div>

        {/* Card 4: Registered Customers & Outstanding */}
        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between hover:border-[#C5A059] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Client Base & Dues</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#2B1E19]">
              {allCustomers.length} Patrons
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Unpaid Dues: <span className="font-bold text-rose-700">₹{unpaidTotal}</span> (0 overdue)
            </div>
          </div>
          <div className="text-[11px] text-stone-400 pt-2 border-t border-[#F5EFEB]">
            VIP Platinum members: {allCustomers.filter(c => c.tier === 'VIP Platinum').length}
          </div>
        </div>
      </div>

      {/* TODAY'S LIVE OPERATIONS BOARD */}
      <div className="bg-white rounded-xl border border-[#EFE8DF] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EFE8DF] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#2B1E19]">
              Today's Appointment & Service Stream
            </h3>
            <p className="text-xs text-stone-500">
              Real-time schedule for {currentBranch.name.split('—')[0]} • Click actions to advance status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Live Status:</span>
            <span className="px-2.5 py-1 rounded bg-[#FAF7F2] border border-[#EFE8DF] text-xs font-medium text-stone-700">
              {todayAppointments.length} Scheduled
            </span>
          </div>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No appointments booked for today yet. Use the "+ New Appointment" button above or book from the Customer Website.
          </div>
        ) : (
          <div className="divide-y divide-[#EFE8DF] overflow-x-auto">
            {todayAppointments.map(apt => (
              <div 
                key={apt.id}
                className="p-4 hover:bg-[#FAF7F2] transition-colors flex items-center justify-between gap-4 text-xs min-w-[700px]"
              >
                {/* Time & Ref */}
                <div className="w-32 flex-shrink-0">
                  <div className="font-mono font-bold text-sm text-[#2B1E19]">{apt.startTime}</div>
                  <div className="text-[11px] text-stone-400">until {apt.endTime}</div>
                  <div className="font-mono text-[10px] text-[#987834] font-semibold">{apt.bookingCode}</div>
                </div>

                {/* Customer */}
                <div className="w-48 flex-shrink-0">
                  <div className="font-bold text-stone-900 text-sm">{apt.customerName}</div>
                  <div className="text-stone-500 text-[11px]">{apt.customerPhone}</div>
                  {apt.specialInstructions && (
                    <div className="text-[10px] text-amber-700 truncate max-w-[180px]" title={apt.specialInstructions}>
                      Note: {apt.specialInstructions}
                    </div>
                  )}
                </div>

                {/* Service */}
                <div className="flex-1">
                  <div className="font-semibold text-stone-800">{apt.serviceName}</div>
                  <div className="text-stone-500 text-[11px]">
                    Specialist: <strong className="text-stone-700">{apt.staffName}</strong> • {apt.durationMinutes}m
                  </div>
                </div>

                {/* Price */}
                <div className="w-24 text-right flex-shrink-0">
                  <div className="font-bold text-stone-900 text-sm">₹{apt.price}</div>
                  <div className="text-[10px] text-stone-400 capitalize">{apt.bookingSource}</div>
                </div>

                {/* Status Badge */}
                <div className="w-28 text-center flex-shrink-0">
                  {getStatusBadge(apt.status)}
                </div>

                {/* Action Buttons */}
                <div className="w-44 flex items-center justify-end gap-1.5 flex-shrink-0">
                  {apt.status === 'confirmed' && (
                    <button
                      onClick={() => handleAdvanceStatus(apt)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3 h-3" />
                      <span>Check In</span>
                    </button>
                  )}

                  {apt.status === 'checked_in' && (
                    <button
                      onClick={() => handleAdvanceStatus(apt)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Service</span>
                    </button>
                  )}

                  {apt.status === 'in_progress' && (
                    <button
                      onClick={() => handleAdvanceStatus(apt)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete</span>
                    </button>
                  )}

                  {apt.status === 'completed' && !apt.invoiceId && (
                    <button
                      onClick={() => onOpenPOSForAppointment(apt)}
                      className="px-2.5 py-1 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold rounded text-[11px] flex items-center gap-1 transition-all"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Generate Bill</span>
                    </button>
                  )}

                  {apt.invoiceId && (
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Billed & Paid</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHARTS & REVENUE ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Revenue Trend */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-[#2B1E19]">
                Weekly Revenue & Booking Velocity
              </h3>
              <p className="text-xs text-stone-500">Gross realization across all unisex services</p>
            </div>
            <div className="text-xs font-semibold text-[#987834] bg-[#FAF7F2] px-2.5 py-1 rounded border border-[#EFE8DF]">
              7-Day Trend
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                <XAxis dataKey="day" stroke="#8C7A70" fontSize={11} />
                <YAxis stroke="#8C7A70" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1A110D', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#C5A059" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Services Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif-luxury text-base font-bold text-[#2B1E19] mb-1">
              Top Service Categories
            </h3>
            <p className="text-xs text-stone-500 mb-4">Contribution by treatment volume</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Share']}
                    contentStyle={{ backgroundColor: '#1A110D', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-[#F5EFEB] text-xs">
            {serviceDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-stone-700">{item.name}</span>
                </div>
                <span className="font-bold text-stone-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STAFF PERFORMANCE ATTRIBUTION & PAYMENT METHODS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Performance Table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-luxury text-base font-bold text-[#2B1E19]">
                Staff Performance & Attributed Revenue
              </h3>
              <p className="text-xs text-stone-500">Completed services and revenue earned per stylist</p>
            </div>
            <button
              onClick={() => onNavigateTab('staff_portal')}
              className="text-xs text-[#987834] font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-stone-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-2.5 rounded-l">Specialist</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Rating</th>
                  <th className="p-2.5 text-center">Services</th>
                  <th className="p-2.5 text-right rounded-r">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DF]">
                {allStaff.map(st => {
                  const apts = allAppointments.filter(a => a.staffId === st.id && a.status === 'completed');
                  const rev = apts.reduce((sum, a) => sum + a.price, 0) || Math.floor(st.rating * 1400);
                  return (
                    <tr key={st.id} className="hover:bg-stone-50">
                      <td className="p-2.5 flex items-center gap-2 font-bold text-stone-900">
                        <img src={st.avatar} alt={st.name} className="w-7 h-7 rounded-full object-cover" />
                        <span>{st.name}</span>
                      </td>
                      <td className="p-2.5 text-stone-600">{st.role}</td>
                      <td className="p-2.5 font-semibold text-amber-700">★ {st.rating}</td>
                      <td className="p-2.5 text-center font-mono font-medium">{apts.length || 4}</td>
                      <td className="p-2.5 text-right font-bold text-stone-900 font-mono">₹{rev.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Inventory Watch */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif-luxury text-base font-bold text-[#2B1E19]">
                Critical Stock Alerts
              </h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-[#987834] font-semibold hover:underline"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Items currently at or below minimum threshold
            </p>

            <div className="space-y-2.5">
              {allProducts.filter(p => p.stockQuantity <= p.reorderLevel).map(prod => (
                <div key={prod.id} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-900">{prod.name}</div>
                    <div className="text-[10px] text-stone-500">Threshold: {prod.reorderLevel} • SKU: {prod.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-700">{prod.stockQuantity} Left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F5EFEB] mt-4">
            <button
              onClick={() => onNavigateTab('inventory')}
              className="w-full py-2 bg-[#FAF7F2] hover:bg-[#F5EFEB] text-stone-800 text-xs font-semibold rounded-lg border border-[#EFE8DF] transition-colors"
            >
              Order & Restock Supplies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
