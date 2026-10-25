import { 
  SalonBranch, 
  Service, 
  Staff, 
  Customer, 
  Appointment, 
  Invoice, 
  Product, 
  SalonReview,
  NotificationLog,
  AppointmentStatus,
  PaymentMethod
} from '../types';

const STORAGE_KEY = 'auraluxe_salon_db_v2';

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const TODAY = getRelativeDate(0);
const YESTERDAY = getRelativeDate(-1);
const TOMORROW = getRelativeDate(1);
const IN_2_DAYS = getRelativeDate(2);

const INITIAL_BRANCHES: SalonBranch[] = [
  {
    id: 'branch-1',
    name: 'AuraLuxe Flagship & Spa — C-Scheme',
    city: 'Jaipur',
    address: 'Plot 14, Ashok Marg, C-Scheme, Jaipur, Rajasthan 302001',
    phone: '+91 141 450 8899',
    email: 'jaipur@auraluxe.com',
    gstNumber: '08AAACA1234A1Z5',
    openingTime: '09:00',
    closingTime: '21:00',
    isActive: true
  },
  {
    id: 'branch-2',
    name: 'AuraLuxe Studio — Greater Kailash II',
    city: 'New Delhi',
    address: 'M-Block Market, GK-2, New Delhi 110048',
    phone: '+91 11 4123 7700',
    email: 'delhi@auraluxe.com',
    gstNumber: '07AAACA1234A1Z2',
    openingTime: '09:30',
    closingTime: '21:30',
    isActive: true
  },
  {
    id: 'branch-3',
    name: 'AuraLuxe Elite — Bandra West',
    city: 'Mumbai',
    address: 'Waterfield Road, Bandra West, Mumbai 400050',
    phone: '+91 22 6789 2200',
    email: 'mumbai@auraluxe.com',
    gstNumber: '27AAACA1234A1Z9',
    openingTime: '10:00',
    closingTime: '22:00',
    isActive: true
  }
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Royal Signature Haircut & Styling',
    category: 'Hair',
    gender: 'unisex',
    description: 'Bespoke consultation, revitalizing hair wash with clarifying shampoo, precision haircut, and custom heat/matte styling.',
    price: 850,
    durationMinutes: 45,
    bufferMinutes: 10,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-101', name: 'Deep Conditioning Scalp Mask', price: 350, durationMinutes: 15 },
      { id: 'add-102', name: 'Beard Trim & Contour', price: 400, durationMinutes: 20 },
      { id: 'add-103', name: 'Moroccan Oil Blowdry Finish', price: 300, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-2',
    name: 'Precision Fade & Hot Towel Beard Sculpting',
    category: 'Grooming & Beard',
    gender: 'male',
    description: 'Zero/skin taper fade with steam hot towel wrap, straight razor outline, botanical beard butter massage.',
    price: 750,
    durationMinutes: 45,
    bufferMinutes: 10,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-201', name: 'Black Charcoal Nose Pore Strip', price: 150, durationMinutes: 10 },
      { id: 'add-202', name: 'Cooling Mint Face Mist & Massage', price: 250, durationMinutes: 10 }
    ]
  },
  {
    id: 'srv-3',
    name: 'Olaplex Bond Building & Moisture Spa',
    category: 'Hair Treatment & Color',
    gender: 'unisex',
    description: 'Intense structural repair using patented Olaplex No. 1 & 2 formulation, restores broken disulfide bonds with infrared therapy.',
    price: 2800,
    durationMinutes: 60,
    bufferMinutes: 15,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-301', name: 'Scalp Micro-Exfoliation Scrub', price: 600, durationMinutes: 15 },
      { id: 'add-302', name: 'Steam Infusion Ampoule', price: 500, durationMinutes: 10 }
    ]
  },
  {
    id: 'srv-4',
    name: 'Balayage / Global Color & Gloss Treatment',
    category: 'Hair Treatment & Color',
    gender: 'unisex',
    description: 'Custom sun-kissed hand-painted balayage or luminous ammonia-free global color finished with an acidic shine gloss.',
    price: 5200,
    durationMinutes: 150,
    bufferMinutes: 20,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-401', name: 'Post-Color Anti-Fade Treatment', price: 800, durationMinutes: 15 },
      { id: 'add-402', name: 'Toner Refresh Gloss', price: 1200, durationMinutes: 20 }
    ]
  },
  {
    id: 'srv-5',
    name: '24K Gold Radiance Facial & Gua Sha Lymphatic',
    category: 'Skin & Facial',
    gender: 'unisex',
    description: 'Luxury brightening facial infused with real 24k gold leaf peptides, collagen booster, and soothing chilled jade Gua Sha therapy.',
    price: 3200,
    durationMinutes: 75,
    bufferMinutes: 15,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-501', name: 'Under-Eye Collagen Patch Infusion', price: 450, durationMinutes: 15 },
      { id: 'add-502', name: 'Neck & Decollete Lifting Pack', price: 650, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-6',
    name: 'Hydra-Dermabrasion Glow Therapy',
    category: 'Skin & Facial',
    gender: 'unisex',
    description: 'Deep vortex pore extraction, salicylic & hyaluronic acid infusion, LED light therapy for instant glass skin glow.',
    price: 3800,
    durationMinutes: 80,
    bufferMinutes: 15,
    image: 'https://images.unsplash.com/photo-1512290900672-1f55a1538356?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-601', name: 'Oxygen Hyperbaric Infusion', price: 750, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-7',
    name: 'Russian Gel Manicure & Custom Nail Art',
    category: 'Nails & Spa',
    gender: 'female',
    description: 'Dry e-file precision cuticle trimming, strengthening builder gel overlay, and high-gloss chip-resistant designer nail art.',
    price: 1600,
    durationMinutes: 60,
    bufferMinutes: 10,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-701', name: 'Chrome Glaze Finish', price: 300, durationMinutes: 10 },
      { id: 'add-702', name: 'Paraffin Wax Hand Bath', price: 500, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-8',
    name: 'Deluxe Champagne Pedicure & Foot Reflexology',
    category: 'Nails & Spa',
    gender: 'unisex',
    description: 'Epsom salt soak, callus smoothing, champagne grape seed scrub, hydrating mask, and 20-minute therapeutic acupressure foot massage.',
    price: 1450,
    durationMinutes: 60,
    bufferMinutes: 15,
    image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    addOns: [
      { id: 'add-801', name: 'Hot Stone Therapy Addition', price: 400, durationMinutes: 15 }
    ]
  },
  {
    id: 'srv-9',
    name: 'The Gentleman’s Complete Grooming Ritual',
    category: 'Bridal & Packages',
    gender: 'male',
    description: 'Signature haircut, beard luxury spa, express charcoal detox facial, and relaxing shoulder & neck tension-relief massage.',
    price: 2400,
    durationMinutes: 90,
    bufferMinutes: 15,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    isActive: true
  },
  {
    id: 'srv-10',
    name: 'Pre-Occasion Bridal & Groom Glow Ritual',
    category: 'Bridal & Packages',
    gender: 'unisex',
    description: '24K Gold luxury facial, full body skin polish, Olaplex hair restorative therapy, and Deluxe Spa Manicure + Pedicure combo.',
    price: 7500,
    durationMinutes: 180,
    bufferMinutes: 30,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    isActive: true
  }
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Vikram Rathore',
    role: 'Master Stylist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    email: 'vikram@auraluxe.com',
    phone: '+91 98290 11223',
    branchId: 'branch-1',
    specialties: ['Precision Fades', 'Scissor Craft', 'Beard Architect', 'Men Grooming'],
    rating: 4.92,
    reviewsCount: 428,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    shiftStart: '09:30',
    shiftEnd: '19:30',
    commissionRate: 0.18,
    isAvailableNow: true
  },
  {
    id: 'staff-2',
    name: 'Elena Vance',
    role: 'Senior Stylist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    email: 'elena@auraluxe.com',
    phone: '+91 98110 33445',
    branchId: 'branch-1',
    specialties: ['Couture Cuts', 'Balayage & Color', 'Olaplex Therapy', 'Bridal Hair'],
    rating: 4.96,
    reviewsCount: 560,
    workingDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    shiftStart: '10:00',
    shiftEnd: '20:00',
    commissionRate: 0.20,
    isAvailableNow: true
  },
  {
    id: 'staff-3',
    name: 'Meera Joshi',
    role: 'Aesthetician',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    email: 'meera@auraluxe.com',
    phone: '+91 98200 55667',
    branchId: 'branch-1',
    specialties: ['HydraFacial', '24K Gold Rituals', 'Skin Dermabrasion', 'Gua Sha'],
    rating: 4.89,
    reviewsCount: 312,
    workingDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    shiftStart: '10:30',
    shiftEnd: '19:30',
    commissionRate: 0.15,
    isAvailableNow: true
  },
  {
    id: 'staff-4',
    name: 'Arjun Kapoor',
    role: 'Barber Artist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    email: 'arjun@auraluxe.com',
    phone: '+91 99100 88990',
    branchId: 'branch-2',
    specialties: ['Classic Tapers', 'Hot Towel Shave', 'Textured Hair'],
    rating: 4.86,
    reviewsCount: 245,
    workingDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    shiftStart: '09:00',
    shiftEnd: '18:00',
    commissionRate: 0.15,
    isAvailableNow: true
  },
  {
    id: 'staff-5',
    name: 'Sarah Thomas',
    role: 'Nail Technician',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    email: 'sarah@auraluxe.com',
    phone: '+91 98222 44331',
    branchId: 'branch-1',
    specialties: ['Russian Gel', 'Nail Artistry', 'Champagne Pedicure'],
    rating: 4.94,
    reviewsCount: 198,
    workingDays: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    shiftStart: '11:00',
    shiftEnd: '20:00',
    commissionRate: 0.15,
    isAvailableNow: true
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Aditi Sharma',
    phone: '+91 98290 44551',
    email: 'aditi.sharma@example.com',
    branchId: 'branch-1',
    tier: 'VIP Platinum',
    loyaltyPoints: 1240,
    totalVisits: 14,
    totalSpent: 26800,
    lastVisitDate: YESTERDAY,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    preferences: {
      preferredStaffId: 'staff-2',
      favoriteServices: ['srv-4', 'srv-3'],
      drinkPreference: 'Green Tea with honey',
      allergyNotes: 'Sensitive to ammonia bleach. Always use Olaplex step 1.',
      consultationNotes: 'Loves ash blonde tones. Prefers soft curtain bangs.'
    },
    createdAt: '2025-04-12'
  },
  {
    id: 'cust-2',
    name: 'Rohan Verma',
    phone: '+91 98112 33441',
    email: 'rohan.v@example.com',
    branchId: 'branch-1',
    tier: 'Gold',
    loyaltyPoints: 680,
    totalVisits: 9,
    totalSpent: 11450,
    lastVisitDate: TODAY,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    preferences: {
      preferredStaffId: 'staff-1',
      favoriteServices: ['srv-1', 'srv-2'],
      drinkPreference: 'Black Espresso (no sugar)',
      allergyNotes: 'No known allergies',
      consultationNotes: 'Low taper fade, medium scissor trim on top.'
    },
    createdAt: '2025-07-20'
  },
  {
    id: 'cust-3',
    name: 'Priyanka Roy',
    phone: '+91 99280 66778',
    email: 'priyanka.roy@example.com',
    branchId: 'branch-1',
    tier: 'Gold',
    loyaltyPoints: 520,
    totalVisits: 6,
    totalSpent: 9800,
    lastVisitDate: getRelativeDate(-4),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    preferences: {
      preferredStaffId: 'staff-3',
      favoriteServices: ['srv-5', 'srv-7'],
      drinkPreference: 'Iced Latte',
      allergyNotes: 'Rosacea prone skin - avoids high heat treatments.'
    },
    createdAt: '2025-09-10'
  },
  {
    id: 'cust-4',
    name: 'Siddharth Malhotra',
    phone: '+91 97110 99882',
    email: 'siddharth.m@example.com',
    branchId: 'branch-1',
    tier: 'Silver',
    loyaltyPoints: 280,
    totalVisits: 4,
    totalSpent: 5400,
    lastVisitDate: getRelativeDate(-7),
    preferences: {
      preferredStaffId: 'staff-1',
      favoriteServices: ['srv-2', 'srv-9'],
      drinkPreference: 'Cold Sparkling Water'
    },
    createdAt: '2025-11-02'
  },
  {
    id: 'cust-5',
    name: 'Natasha Kapoor',
    phone: '+91 98200 11229',
    email: 'natasha.k@example.com',
    branchId: 'branch-1',
    tier: 'Bronze',
    loyaltyPoints: 120,
    totalVisits: 2,
    totalSpent: 2900,
    lastVisitDate: getRelativeDate(-12),
    preferences: {
      preferredStaffId: 'staff-5',
      favoriteServices: ['srv-7']
    },
    createdAt: '2026-01-15'
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    bookingCode: 'AL-8492',
    branchId: 'branch-1',
    customerId: 'cust-2',
    customerName: 'Rohan Verma',
    customerPhone: '+91 98112 33441',
    serviceId: 'srv-1',
    serviceName: 'Royal Signature Haircut & Styling',
    selectedAddOns: ['add-102'],
    staffId: 'staff-1',
    staffName: 'Vikram Rathore',
    date: TODAY,
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    price: 1250,
    discount: 100,
    status: 'in_progress',
    specialInstructions: 'Customer requested low skin fade and styling wax finish.',
    bookingSource: 'website',
    createdAt: '2026-10-21T09:15:00Z'
  },
  {
    id: 'apt-2',
    bookingCode: 'AL-9104',
    branchId: 'branch-1',
    customerId: 'cust-1',
    customerName: 'Aditi Sharma',
    customerPhone: '+91 98290 44551',
    serviceId: 'srv-3',
    serviceName: 'Olaplex Bond Building & Moisture Spa',
    selectedAddOns: ['add-301'],
    staffId: 'staff-2',
    staffName: 'Elena Vance',
    date: TODAY,
    startTime: '11:30',
    endTime: '12:45',
    durationMinutes: 75,
    price: 3400,
    discount: 300,
    status: 'checked_in',
    specialInstructions: 'VIP Platinum member. Serving jasmine green tea.',
    bookingSource: 'website',
    createdAt: '2026-10-22T14:30:00Z'
  },
  {
    id: 'apt-3',
    bookingCode: 'AL-7721',
    branchId: 'branch-1',
    customerId: 'cust-3',
    customerName: 'Priyanka Roy',
    customerPhone: '+91 99280 66778',
    serviceId: 'srv-5',
    serviceName: '24K Gold Radiance Facial & Gua Sha Lymphatic',
    staffId: 'staff-3',
    staffName: 'Meera Joshi',
    date: TODAY,
    startTime: '14:00',
    endTime: '15:15',
    durationMinutes: 75,
    price: 3200,
    discount: 0,
    status: 'confirmed',
    bookingSource: 'phone',
    createdAt: '2026-10-22T16:00:00Z'
  },
  {
    id: 'apt-4',
    bookingCode: 'AL-6309',
    branchId: 'branch-1',
    customerId: 'cust-4',
    customerName: 'Siddharth Malhotra',
    customerPhone: '+91 97110 99882',
    serviceId: 'srv-2',
    serviceName: 'Precision Fade & Hot Towel Beard Sculpting',
    staffId: 'staff-1',
    staffName: 'Vikram Rathore',
    date: TODAY,
    startTime: '16:00',
    endTime: '16:45',
    durationMinutes: 45,
    price: 750,
    discount: 0,
    status: 'confirmed',
    bookingSource: 'website',
    createdAt: '2026-10-22T18:20:00Z'
  },
  {
    id: 'apt-5',
    bookingCode: 'AL-5120',
    branchId: 'branch-1',
    customerId: 'cust-5',
    customerName: 'Natasha Kapoor',
    customerPhone: '+91 98200 11229',
    serviceId: 'srv-7',
    serviceName: 'Russian Gel Manicure & Custom Nail Art',
    staffId: 'staff-5',
    staffName: 'Sarah Thomas',
    date: TODAY,
    startTime: '09:30',
    endTime: '10:30',
    durationMinutes: 60,
    price: 1600,
    discount: 0,
    status: 'completed',
    bookingSource: 'walk_in',
    createdAt: '2026-10-23T04:00:00Z'
  },
  {
    id: 'apt-6',
    bookingCode: 'AL-8812',
    branchId: 'branch-1',
    customerId: 'cust-1',
    customerName: 'Aditi Sharma',
    customerPhone: '+91 98290 44551',
    serviceId: 'srv-4',
    serviceName: 'Balayage / Global Color & Gloss Treatment',
    staffId: 'staff-2',
    staffName: 'Elena Vance',
    date: TOMORROW,
    startTime: '11:00',
    endTime: '13:30',
    durationMinutes: 150,
    price: 5200,
    discount: 500,
    status: 'confirmed',
    bookingSource: 'website',
    createdAt: '2026-10-22T10:00:00Z'
  },
  {
    id: 'apt-7',
    bookingCode: 'AL-4490',
    branchId: 'branch-1',
    customerId: 'cust-2',
    customerName: 'Rohan Verma',
    customerPhone: '+91 98112 33441',
    serviceId: 'srv-9',
    serviceName: 'The Gentleman’s Complete Grooming Ritual',
    staffId: 'staff-1',
    staffName: 'Vikram Rathore',
    date: IN_2_DAYS,
    startTime: '14:30',
    endTime: '16:00',
    durationMinutes: 90,
    price: 2400,
    discount: 0,
    status: 'confirmed',
    bookingSource: 'website',
    createdAt: '2026-10-22T11:00:00Z'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Olaplex No. 3 Hair Perfector',
    sku: 'OLP-003-100ML',
    category: 'Hair Care',
    brand: 'Olaplex',
    stockQuantity: 18,
    reorderLevel: 5,
    costPrice: 1950,
    sellingPrice: 2950,
    supplier: 'Olaplex India Official',
    unit: 'Bottle (100ml)',
    lastRestockedDate: '2026-10-10',
    branchId: 'branch-1'
  },
  {
    id: 'prod-2',
    name: 'Moroccanoil Original Treatment Light',
    sku: 'MOR-OIL-100ML',
    category: 'Hair Care',
    brand: 'Moroccanoil',
    stockQuantity: 12,
    reorderLevel: 4,
    costPrice: 2400,
    sellingPrice: 3800,
    supplier: 'Beauty Trends Ltd',
    unit: 'Glass Pump (100ml)',
    lastRestockedDate: '2026-10-14',
    branchId: 'branch-1'
  },
  {
    id: 'prod-3',
    name: 'L’Oréal Professionnel Absolut Repair Shampoo',
    sku: 'LOR-ABS-300ML',
    category: 'Hair Care',
    brand: 'L’Oréal',
    stockQuantity: 4, // LOW STOCK
    reorderLevel: 6,
    costPrice: 650,
    sellingPrice: 990,
    supplier: 'L’Oréal Distribution India',
    unit: 'Bottle (300ml)',
    lastRestockedDate: '2026-09-28',
    branchId: 'branch-1'
  },
  {
    id: 'prod-4',
    name: 'Forest Essentials Soundarya 24K Gold Cream',
    sku: 'FE-SND-50G',
    category: 'Skin & Face',
    brand: 'Forest Essentials',
    stockQuantity: 7,
    reorderLevel: 3,
    costPrice: 3200,
    sellingPrice: 4800,
    supplier: 'Ayur Luxe Direct',
    unit: 'Jar (50g)',
    lastRestockedDate: '2026-10-12',
    branchId: 'branch-1'
  },
  {
    id: 'prod-5',
    name: 'Artisan Sandalwood Beard Balm & Wax',
    sku: 'ART-BRD-60G',
    category: 'Beard & Grooming',
    brand: 'AuraLuxe Apothecary',
    stockQuantity: 24,
    reorderLevel: 8,
    costPrice: 350,
    sellingPrice: 750,
    supplier: 'In-House Formulations',
    unit: 'Tin (60g)',
    lastRestockedDate: '2026-10-18',
    branchId: 'branch-1'
  },
  {
    id: 'prod-6',
    name: 'OPI ProSpa Protective Hand Serum',
    sku: 'OPI-HND-112ML',
    category: 'Tools & Consumables',
    brand: 'OPI',
    stockQuantity: 2, // CRITICAL LOW STOCK
    reorderLevel: 5,
    costPrice: 1100,
    sellingPrice: 1650,
    supplier: 'Nail Artisans Corp',
    unit: 'Pump Bottle (112ml)',
    lastRestockedDate: '2026-09-15',
    branchId: 'branch-1'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-1040',
    branchId: 'branch-1',
    customerId: 'cust-5',
    customerName: 'Natasha Kapoor',
    customerPhone: '+91 98200 11229',
    appointmentId: 'apt-5',
    staffId: 'staff-5',
    staffName: 'Sarah Thomas',
    items: [
      { id: 'item-1', type: 'service', name: 'Russian Gel Manicure & Custom Nail Art', quantity: 1, unitPrice: 1600, totalPrice: 1600 },
      { id: 'item-2', type: 'product', name: 'OPI ProSpa Protective Hand Serum', quantity: 1, unitPrice: 1650, totalPrice: 1650 }
    ],
    subtotal: 3250,
    discountAmount: 250,
    discountCode: 'WELCOME10',
    taxAmount: 540, // ~18% GST on 3000
    finalTotal: 3540,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    notes: 'Paid via PhonePe UPI. Customer thrilled with ombre chrome finish.',
    upiTransactionRef: 'UPI/20261023/8492019482',
    createdAt: `${TODAY}T10:35:00Z`
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-1039',
    branchId: 'branch-1',
    customerId: 'cust-1',
    customerName: 'Aditi Sharma',
    customerPhone: '+91 98290 44551',
    staffId: 'staff-2',
    staffName: 'Elena Vance',
    items: [
      { id: 'item-3', type: 'service', name: 'Olaplex Bond Building & Moisture Spa', quantity: 1, unitPrice: 2800, totalPrice: 2800 },
      { id: 'item-4', type: 'product', name: 'Olaplex No. 3 Hair Perfector', quantity: 1, unitPrice: 2950, totalPrice: 2950 }
    ],
    subtotal: 5750,
    discountAmount: 575,
    discountCode: 'VIP10',
    taxAmount: 931.5,
    finalTotal: 6106.5,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    createdAt: `${YESTERDAY}T17:45:00Z`
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-1038',
    branchId: 'branch-1',
    customerId: 'cust-2',
    customerName: 'Rohan Verma',
    customerPhone: '+91 98112 33441',
    staffId: 'staff-1',
    staffName: 'Vikram Rathore',
    items: [
      { id: 'item-5', type: 'service', name: 'Precision Fade & Hot Towel Beard Sculpting', quantity: 1, unitPrice: 750, totalPrice: 750 },
      { id: 'item-6', type: 'product', name: 'Artisan Sandalwood Beard Balm & Wax', quantity: 1, unitPrice: 750, totalPrice: 750 }
    ],
    subtotal: 1500,
    discountAmount: 0,
    taxAmount: 270,
    finalTotal: 1770,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    upiTransactionRef: 'UPI/20261022/9837264811',
    createdAt: `${YESTERDAY}T14:15:00Z`
  }
];

const INITIAL_REVIEWS: SalonReview[] = [
  {
    id: 'rev-1',
    customerName: 'Aditi Sharma',
    serviceName: 'Balayage & Olaplex Spa',
    rating: 5,
    comment: 'Elena is an absolute wizard with blonde tones! My hair has never felt so soft and radiant. The ambience at C-Scheme flagship is world-class.',
    date: '3 days ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'rev-2',
    customerName: 'Rohan Verma',
    serviceName: 'Royal Haircut & Beard Sculpting',
    rating: 5,
    comment: 'Vikram’s attention to detail on the skin fade and hot towel straight razor shave is unmatched anywhere in North India. Top tier experience.',
    date: '1 week ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'rev-3',
    customerName: 'Dr. Tanya Bose',
    serviceName: '24K Gold Radiance Facial',
    rating: 5,
    comment: 'Meera’s facial technique and the chilled jade Gua Sha drained all stress. My skin looked illuminated for my sister’s reception.',
    date: '2 weeks ago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  }
];

interface SalonDatabase {
  branches: SalonBranch[];
  services: Service[];
  staff: Staff[];
  customers: Customer[];
  appointments: Appointment[];
  invoices: Invoice[];
  products: Product[];
  reviews: SalonReview[];
  notifications: NotificationLog[];
}

type DatabaseListener = (data: SalonDatabase) => void;

class SalonDBService {
  private listeners: DatabaseListener[] = [];
  private data: SalonDatabase;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): SalonDatabase {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored salon database, resetting to seed defaults', e);
    }

    const initialData: SalonDatabase = {
      branches: INITIAL_BRANCHES,
      services: INITIAL_SERVICES,
      staff: INITIAL_STAFF,
      customers: INITIAL_CUSTOMERS,
      appointments: INITIAL_APPOINTMENTS,
      invoices: INITIAL_INVOICES,
      products: INITIAL_PRODUCTS,
      reviews: INITIAL_REVIEWS,
      notifications: []
    };

    this.saveToStorage(initialData);
    return initialData;
  }

  private saveToStorage(data: SalonDatabase) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.data = data;
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving salon database to localStorage', e);
    }
  }

  public subscribe(listener: DatabaseListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.data));
  }

  // --- Read Methods ---
  public getData(): SalonDatabase {
    return this.data;
  }

  public getBranches(): SalonBranch[] {
    return this.data.branches;
  }

  public getServices(): Service[] {
    return this.data.services.filter(s => s.isActive);
  }

  public getAllServices(): Service[] {
    return this.data.services;
  }

  public getStaff(branchId?: string): Staff[] {
    if (branchId) {
      return this.data.staff.filter(s => s.branchId === branchId);
    }
    return this.data.staff;
  }

  public getCustomers(branchId?: string): Customer[] {
    if (branchId) {
      return this.data.customers.filter(c => c.branchId === branchId);
    }
    return this.data.customers;
  }

  public getAppointments(branchId?: string): Appointment[] {
    if (branchId) {
      return this.data.appointments.filter(a => a.branchId === branchId);
    }
    return this.data.appointments;
  }

  public getInvoices(branchId?: string): Invoice[] {
    if (branchId) {
      return this.data.invoices.filter(i => i.branchId === branchId);
    }
    return this.data.invoices;
  }

  public getProducts(branchId?: string): Product[] {
    if (branchId) {
      return this.data.products.filter(p => p.branchId === branchId);
    }
    return this.data.products;
  }

  public getReviews(): SalonReview[] {
    return this.data.reviews;
  }

  // --- Write Methods ---

  public createAppointment(input: {
    branchId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    selectedAddOns?: string[];
    staffId: string;
    date: string;
    startTime: string;
    specialInstructions?: string;
    bookingSource?: 'website' | 'phone' | 'walk_in' | 'staff_portal';
  }): { success: boolean; appointment?: Appointment; error?: string } {
    const service = this.data.services.find(s => s.id === input.serviceId);
    if (!service) return { success: false, error: 'Service not found' };

    const staff = this.data.staff.find(s => s.id === input.staffId);
    if (!staff) return { success: false, error: 'Specialist not found' };

    // Calculate total duration & price
    let totalDuration = service.durationMinutes;
    let totalPrice = service.price;

    if (input.selectedAddOns && input.selectedAddOns.length > 0 && service.addOns) {
      service.addOns.forEach(addon => {
        if (input.selectedAddOns?.includes(addon.id)) {
          totalDuration += addon.durationMinutes;
          totalPrice += addon.price;
        }
      });
    }

    // Calculate End Time (e.g. 10:00 + 45 mins -> 10:45)
    const [startHour, startMin] = input.startTime.split(':').map(Number);
    const endMinutesTotal = startHour * 60 + startMin + totalDuration;
    const endHour = Math.floor(endMinutesTotal / 60);
    const endMin = endMinutesTotal % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Conflict Check: ensure staff isn't already booked during this time on this date
    const conflicting = this.data.appointments.find(a => 
      a.staffId === input.staffId &&
      a.date === input.date &&
      a.status !== 'cancelled' &&
      a.status !== 'no_show' &&
      (
        (input.startTime >= a.startTime && input.startTime < a.endTime) ||
        (endTime > a.startTime && endTime <= a.endTime) ||
        (input.startTime <= a.startTime && endTime >= a.endTime)
      )
    );

    if (conflicting) {
      return { 
        success: false, 
        error: `${staff.name} is already booked from ${conflicting.startTime} to ${conflicting.endTime} on ${input.date}. Please select another time or specialist.` 
      };
    }

    // Find or create customer record
    let customer = this.data.customers.find(c => c.phone.replace(/\D/g, '') === input.customerPhone.replace(/\D/g, ''));
    if (!customer) {
      customer = {
        id: `cust-${Date.now()}`,
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail || '',
        branchId: input.branchId,
        tier: 'Bronze',
        loyaltyPoints: 50,
        totalVisits: 1,
        totalSpent: 0,
        lastVisitDate: input.date,
        preferences: {
          preferredStaffId: input.staffId,
          favoriteServices: [input.serviceId]
        },
        createdAt: new Date().toISOString()
      };
      this.data.customers.push(customer);
    } else {
      customer.totalVisits += 1;
      customer.lastVisitDate = input.date;
    }

    // Generate random 4-digit reference code
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `AL-${randomCode}`;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      bookingCode,
      branchId: input.branchId,
      customerId: customer.id,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      serviceId: input.serviceId,
      serviceName: service.name,
      selectedAddOns: input.selectedAddOns,
      staffId: staff.id,
      staffName: staff.name,
      date: input.date,
      startTime: input.startTime,
      endTime,
      durationMinutes: totalDuration,
      price: totalPrice,
      discount: 0,
      status: 'confirmed',
      specialInstructions: input.specialInstructions,
      bookingSource: input.bookingSource || 'website',
      createdAt: new Date().toISOString()
    };

    this.data.appointments.unshift(newAppointment);

    // Record notification log
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipient: input.customerPhone,
      channel: 'whatsapp',
      title: 'Appointment Confirmed',
      content: `Hello ${input.customerName}! Your appointment for ${service.name} with ${staff.name} at AuraLuxe is confirmed for ${input.date} at ${input.startTime}. Reference: ${bookingCode}`,
      status: 'delivered',
      sentAt: new Date().toISOString()
    });

    this.saveToStorage({ ...this.data });
    return { success: true, appointment: newAppointment };
  }

  public updateAppointmentStatus(id: string, status: AppointmentStatus): boolean {
    const apt = this.data.appointments.find(a => a.id === id);
    if (!apt) return false;
    apt.status = status;
    this.saveToStorage({ ...this.data });
    return true;
  }

  public rescheduleAppointment(id: string, newDate: string, newStartTime: string): { success: boolean; error?: string } {
    const apt = this.data.appointments.find(a => a.id === id);
    if (!apt) return { success: false, error: 'Appointment not found' };

    // Calculate new end time
    const [startHour, startMin] = newStartTime.split(':').map(Number);
    const endMinutesTotal = startHour * 60 + startMin + apt.durationMinutes;
    const endHour = Math.floor(endMinutesTotal / 60);
    const endMin = endMinutesTotal % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    // Check conflict
    const conflicting = this.data.appointments.find(a => 
      a.id !== id &&
      a.staffId === apt.staffId &&
      a.date === newDate &&
      a.status !== 'cancelled' &&
      a.status !== 'no_show' &&
      (
        (newStartTime >= a.startTime && newStartTime < a.endTime) ||
        (endTime > a.startTime && endTime <= a.endTime)
      )
    );

    if (conflicting) {
      return { success: false, error: 'Specialist is unavailable at this new time slot.' };
    }

    apt.date = newDate;
    apt.startTime = newStartTime;
    apt.endTime = endTime;
    apt.status = 'confirmed';

    this.saveToStorage({ ...this.data });
    return { success: true };
  }

  public createInvoice(input: {
    branchId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    appointmentId?: string;
    staffId?: string;
    staffName?: string;
    items: {
      type: 'service' | 'product';
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
    }[];
    discountAmount: number;
    discountCode?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): { success: boolean; invoice?: Invoice; error?: string } {
    let subtotal = 0;
    const invoiceItems = input.items.map((item, idx) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;

      // If product, reduce stock
      if (item.type === 'product') {
        const prod = this.data.products.find(p => p.id === item.id);
        if (prod) {
          prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        }
      }

      return {
        id: `item-${Date.now()}-${idx}`,
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice
      };
    });

    const taxableAmount = Math.max(0, subtotal - input.discountAmount);
    const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100; // 18% GST
    const finalTotal = taxableAmount + taxAmount;

    const invoiceNumber = `INV-2026-${1000 + this.data.invoices.length + 1}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      branchId: input.branchId,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      appointmentId: input.appointmentId,
      staffId: input.staffId,
      staffName: input.staffName,
      items: invoiceItems,
      subtotal,
      discountAmount: input.discountAmount,
      discountCode: input.discountCode,
      taxAmount,
      finalTotal,
      paymentMethod: input.paymentMethod,
      paymentStatus: 'paid',
      notes: input.notes,
      createdAt: new Date().toISOString(),
      upiTransactionRef: input.paymentMethod === 'upi' ? `UPI/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined
    };

    this.data.invoices.unshift(newInvoice);

    // Update customer spend & loyalty points
    const customer = this.data.customers.find(c => c.id === input.customerId);
    if (customer) {
      customer.totalSpent += finalTotal;
      const earnedPoints = Math.floor(finalTotal / 20); // 1 point per ₹20
      customer.loyaltyPoints += earnedPoints;

      // Tier upgrade logic
      if (customer.totalSpent > 25000) customer.tier = 'VIP Platinum';
      else if (customer.totalSpent > 10000) customer.tier = 'Gold';
      else if (customer.totalSpent > 4000) customer.tier = 'Silver';
    }

    // Mark appointment completed if linked
    if (input.appointmentId) {
      const apt = this.data.appointments.find(a => a.id === input.appointmentId);
      if (apt) {
        apt.status = 'completed';
        apt.invoiceId = newInvoice.id;
      }
    }

    this.saveToStorage({ ...this.data });
    return { success: true, invoice: newInvoice };
  }

  public updateProductStock(productId: string, deltaQuantity: number): boolean {
    const prod = this.data.products.find(p => p.id === productId);
    if (!prod) return false;
    prod.stockQuantity = Math.max(0, prod.stockQuantity + deltaQuantity);
    prod.lastRestockedDate = TODAY;
    this.saveToStorage({ ...this.data });
    return true;
  }

  public createProduct(product: Omit<Product, 'id' | 'lastRestockedDate'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      lastRestockedDate: TODAY
    };
    this.data.products.unshift(newProduct);
    this.saveToStorage({ ...this.data });
    return newProduct;
  }

  public createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'tier' | 'totalVisits' | 'totalSpent' | 'lastVisitDate'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      tier: 'Bronze',
      loyaltyPoints: 50,
      totalVisits: 0,
      totalSpent: 0,
      lastVisitDate: TODAY,
      createdAt: TODAY
    };
    this.data.customers.unshift(newCustomer);
    this.saveToStorage({ ...this.data });
    return newCustomer;
  }

  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.loadFromStorage();
    this.notifyListeners();
  }

  public exportJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.services && parsed.appointments && parsed.branches) {
        this.saveToStorage(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON imported', e);
    }
    return false;
  }
}

export const salonDB = new SalonDBService();
