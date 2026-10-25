import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { CustomerWebsite } from './components/customer/CustomerWebsite';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AppointmentManager } from './components/appointments/AppointmentManager';
import { POSBilling } from './components/billing/POSBilling';
import { CustomerCRM } from './components/crm/CustomerCRM';
import { StaffPortal } from './components/staff/StaffPortal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { BranchSettings } from './components/settings/BranchSettings';
import { salonDB } from './services/db';
import { Appointment, Customer } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('website');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('branch-1');
  const [dbVersion, setDbVersion] = useState(0);

  // Cross-component coordination state
  const [preselectedAppointment, setPreselectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Subscribe to DB updates for reactive real-time state across portals
  useEffect(() => {
    const unsubscribe = salonDB.subscribe(() => {
      setDbVersion(v => v + 1);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenPOSForAppointment = (apt: Appointment) => {
    setPreselectedAppointment(apt);
    setActiveTab('pos');
  };

  const handleBookForCustomer = (cust: Customer) => {
    setIsAppointmentModalOpen(true);
    setActiveTab('appointments');
  };

  const handleOpenPOSForCustomer = (cust: Customer) => {
    setPreselectedAppointment(null);
    setActiveTab('pos');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241814] flex flex-col font-sans-clean" key={dbVersion}>
      {/* Top Main Navigation Bar with Role & Portal Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'website' && (
          <CustomerWebsite
            selectedBranchId={selectedBranchId}
            onOpenAdmin={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            selectedBranchId={selectedBranchId}
            onNavigateTab={setActiveTab}
            onOpenNewBookingModal={() => {
              setActiveTab('appointments');
              setIsAppointmentModalOpen(true);
            }}
            onOpenPOSForAppointment={handleOpenPOSForAppointment}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentManager
            selectedBranchId={selectedBranchId}
            isCreateModalOpen={isAppointmentModalOpen}
            setIsCreateModalOpen={setIsAppointmentModalOpen}
            onOpenPOSForAppointment={handleOpenPOSForAppointment}
          />
        )}

        {activeTab === 'pos' && (
          <POSBilling
            selectedBranchId={selectedBranchId}
            preselectedAppointment={preselectedAppointment}
            onClearPreselectedAppointment={() => setPreselectedAppointment(null)}
          />
        )}

        {activeTab === 'crm' && (
          <CustomerCRM
            selectedBranchId={selectedBranchId}
            onBookForCustomer={handleBookForCustomer}
            onOpenPOSForCustomer={handleOpenPOSForCustomer}
          />
        )}

        {activeTab === 'staff_portal' && (
          <StaffPortal selectedBranchId={selectedBranchId} />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager selectedBranchId={selectedBranchId} />
        )}

        {activeTab === 'settings' && (
          <BranchSettings
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
          />
        )}
      </main>
    </div>
  );
}

export default App;
