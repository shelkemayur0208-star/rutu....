export type UserRole = 'owner' | 'manager' | 'receptionist' | 'stylist' | 'customer';

export type AppointmentStatus = 
  | 'booked' 
  | 'confirmed' 
  | 'checked_in' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type PaymentMethod = 'upi' | 'cash' | 'card' | 'net_banking';
export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid' | 'refunded';

export type CustomerTier = 'Bronze' | 'Silver' | 'Gold' | 'VIP Platinum';

export interface SalonBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  openingTime: string; // e.g. "09:00"
  closingTime: string; // e.g. "21:00"
  isActive: boolean;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Service {
  id: string;
  name: string;
  category: 'Hair' | 'Skin & Facial' | 'Hair Treatment & Color' | 'Grooming & Beard' | 'Nails & Spa' | 'Bridal & Packages';
  gender: 'unisex' | 'female' | 'male';
  description: string;
  price: number;
  durationMinutes: number;
  bufferMinutes: number;
  image: string;
  isActive: boolean;
  addOns?: ServiceAddOn[];
  eligibleRoles?: string[];
}

export interface Staff {
  id: string;
  name: string;
  role: 'Master Stylist' | 'Senior Stylist' | 'Color Specialist' | 'Aesthetician' | 'Barber Artist' | 'Nail Technician';
  avatar: string;
  email: string;
  phone: string;
  branchId: string;
  specialties: string[];
  rating: number;
  reviewsCount: number;
  workingDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  shiftStart: string; // "10:00"
  shiftEnd: string; // "19:00"
  commissionRate: number; // e.g. 0.15 for 15%
  isAvailableNow: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  branchId: string;
  tier: CustomerTier;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate: string;
  avatar?: string;
  preferences: {
    preferredStaffId?: string;
    favoriteServices?: string[];
    drinkPreference?: string;
    allergyNotes?: string;
    consultationNotes?: string;
  };
  createdAt: string;
}

export interface Appointment {
  id: string;
  bookingCode: string; // e.g. "AL-8492"
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  selectedAddOns?: string[];
  staffId: string;
  staffName: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  durationMinutes: number;
  price: number;
  discount: number;
  status: AppointmentStatus;
  specialInstructions?: string;
  bookingSource: 'website' | 'phone' | 'walk_in' | 'staff_portal';
  invoiceId?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // "INV-2026-1042"
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  appointmentId?: string;
  staffId?: string;
  staffName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxAmount: number; // 18% GST (9% CGST + 9% SGST)
  finalTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  upiTransactionRef?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Hair Care' | 'Skin & Face' | 'Styling & Color' | 'Beard & Grooming' | 'Tools & Consumables';
  brand: string;
  stockQuantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  unit: string; // "Bottle (250ml)", "Box", "Tub (500ml)"
  lastRestockedDate: string;
  branchId: string;
}

export interface NotificationLog {
  id: string;
  recipient: string;
  channel: 'whatsapp' | 'sms' | 'email';
  title: string;
  content: string;
  status: 'delivered' | 'pending';
  sentAt: string;
}

export interface SalonReview {
  id: string;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}
