import React, { useState } from 'react';
import { 
  Scissors, 
  Calendar, 
  Clock, 
  Sparkles, 
  Star, 
  ChevronRight, 
  CheckCircle, 
  Phone, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Heart, 
  Award,
  ArrowRight,
  User,
  X,
  AlertCircle,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { salonDB } from '../../services/db';
import { Service, Staff, Appointment, SalonBranch } from '../../types';

interface CustomerWebsiteProps {
  selectedBranchId: string;
  onOpenAdmin: () => void;
}

export const CustomerWebsite: React.FC<CustomerWebsiteProps> = ({
  selectedBranchId,
  onOpenAdmin,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const allServices = salonDB.getServices();
  const allStaff = salonDB.getStaff(selectedBranchId);
  const reviews = salonDB.getReviews();

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Selected Booking Details
  const [bookingBranchId, setBookingBranchId] = useState(selectedBranchId);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [bookingTime, setBookingTime] = useState<string>('11:00');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Service Filter in Website
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // My Bookings Drawer
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [customerBookings, setCustomerBookings] = useState<Appointment[] | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  const categories = [
    'All',
    'Hair',
    'Grooming & Beard',
    'Hair Treatment & Color',
    'Skin & Facial',
    'Nails & Spa',
    'Bridal & Packages'
  ];

  const filteredServices = allServices.filter(s => {
    const matchesCat = activeCategory === 'All' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const timeSlots = [
    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '13:00', '14:00', '14:30', '15:00', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const handleStartBooking = (preselectedService?: Service, preselectedStaffId?: string) => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setSelectedAddOns([]);
      setBookingStep(2);
    } else {
      setSelectedService(null);
      setSelectedAddOns([]);
      setBookingStep(1);
    }

    if (preselectedStaffId) {
      setSelectedStaffId(preselectedStaffId);
    } else {
      setSelectedStaffId('any');
    }

    setBookingError(null);
    setConfirmedBooking(null);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedService) {
      setBookingError('Please choose a service first');
      return;
    }
    if (!custName.trim() || !custPhone.trim()) {
      setBookingError('Please enter your full name and phone number');
      return;
    }

    // Resolve staff if 'any' is selected
    let finalStaffId = selectedStaffId;
    if (finalStaffId === 'any') {
      const eligibleStaff = allStaff.length > 0 ? allStaff : salonDB.getStaff();
      finalStaffId = eligibleStaff[Math.floor(Math.random() * eligibleStaff.length)].id;
    }

    const res = salonDB.createAppointment({
      branchId: bookingBranchId,
      customerName: custName.trim(),
      customerPhone: custPhone.trim(),
      customerEmail: custEmail.trim() || undefined,
      serviceId: selectedService.id,
      selectedAddOns,
      staffId: finalStaffId,
      date: bookingDate,
      startTime: bookingTime,
      specialInstructions: custNotes.trim() || undefined,
      bookingSource: 'website'
    });

    if (!res.success || !res.appointment) {
      setBookingError(res.error || 'Failed to confirm appointment');
      return;
    }

    setConfirmedBooking(res.appointment);
    setBookingStep(5);
    setBookingError(null);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleLookupBookings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    const cleanLookup = lookupPhone.replace(/\D/g, '');
    const all = salonDB.getAppointments();
    const found = all.filter(a => 
      a.customerPhone.replace(/\D/g, '').includes(cleanLookup) || 
      a.bookingCode.toLowerCase() === lookupPhone.trim().toLowerCase()
    );

    if (found.length === 0) {
      setLookupMessage('No appointments found for this phone number or reference code.');
      setCustomerBookings([]);
    } else {
      setLookupMessage(null);
      setCustomerBookings(found);
    }
  };

  const calculateBookingTotal = () => {
    if (!selectedService) return 0;
    let total = selectedService.price;
    if (selectedService.addOns) {
      selectedService.addOns.forEach(add => {
        if (selectedAddOns.includes(add.id)) total += add.price;
      });
    }
    return total;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#241814] flex flex-col font-sans-clean">
      {/* LUXURY HERO SECTION */}
      <section className="relative bg-[#1A110D] text-white overflow-hidden py-16 lg:py-24 border-b border-[#362217]">
        {/* Subtle Luxury Pattern / Ambient Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C5A059]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2B1E19] border border-[#C5A059]/40 text-[#E0C797] text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Premier Unisex Salon & Wellness Sanctuary</span>
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.15] tracking-tight">
                Your Style. <br />
                <span className="italic font-light text-[#E0C797]">Your Confidence.</span> <br />
                Your Sanctuary.
              </h1>

              <p className="text-stone-300 text-base sm:text-lg max-w-xl font-light leading-relaxed">
                Discover bespoke hair styling, precision beard sculpting, 24K gold skin therapies, and restorative treatments designed for both discerning women and gentlemen.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => handleStartBooking()}
                  className="px-7 py-3.5 rounded-lg bg-gradient-to-r from-[#C5A059] to-[#987834] text-[#1A110D] font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#C5A059]/25 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>

                <a
                  href="#services-section"
                  className="px-6 py-3.5 rounded-lg bg-[#2B1E19] hover:bg-[#382620] text-stone-200 text-sm font-medium border border-[#4D3528] transition-all flex items-center gap-2"
                >
                  <span>Explore Menu</span>
                  <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                </a>

                <button
                  onClick={() => setIsLookupOpen(true)}
                  className="text-xs text-[#C5A059] hover:text-[#E0C797] underline underline-offset-4 ml-1 transition-colors"
                >
                  Lookup My Booking
                </button>
              </div>

              {/* Key Trust Stats */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#311E16] max-w-lg">
                <div>
                  <div className="font-cinzel text-2xl font-bold text-[#E0C797]">15k+</div>
                  <div className="text-xs text-stone-400">Happy Patrons</div>
                </div>
                <div>
                  <div className="font-cinzel text-2xl font-bold text-[#E0C797] flex items-center gap-1">
                    4.95 <Star className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                  </div>
                  <div className="text-xs text-stone-400">Master Artists</div>
                </div>
                <div>
                  <div className="font-cinzel text-2xl font-bold text-[#E0C797]">3</div>
                  <div className="text-xs text-stone-400">Luxury Studios</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#C5A059]/40 shadow-2xl bg-[#241814]">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80"
                  alt="AuraLuxe Salon Ambience"
                  className="w-full h-[420px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A110D] via-transparent to-transparent opacity-90"></div>

                {/* Floating Highlight Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl glass-dark border border-[#C5A059]/30 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[#C5A059] font-medium">Currently Selected Studio</div>
                      <div className="text-sm font-semibold">{currentBranch.name}</div>
                      <div className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#C5A059]" />
                        <span>Open Today: {currentBranch.openingTime} – {currentBranch.closingTime}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleStartBooking()}
                      className="px-3 py-1.5 bg-[#C5A059] text-[#1A110D] text-xs font-semibold rounded hover:brightness-110 active:scale-95 transition-all"
                    >
                      Book Here
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BRANCH BANNER */}
      <section className="bg-[#FAF7F2] border-b border-[#EFE8DF] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-stone-700">
            <MapPin className="w-4 h-4 text-[#C5A059]" />
            <span className="font-semibold text-stone-900">Locations:</span>
            <span>Jaipur C-Scheme Flagship</span>
            <span className="text-stone-300">•</span>
            <span>South Delhi GK-2</span>
            <span className="text-stone-300">•</span>
            <span>Mumbai Bandra West</span>
          </div>
          <div className="flex items-center gap-4 text-stone-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              100% Organic & Olaplex Certified
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-[#C5A059]" />
              Hospitality Excellence 2026
            </span>
          </div>
        </div>
      </section>

      {/* SERVICES MENU SECTION */}
      <section id="services-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#987834]">
            Curated Menu & Treatments
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#2B1E19] mt-2 mb-3">
            Signature Services for Everyone
          </h2>
          <p className="text-stone-600 text-sm">
            Every service begins with a personalized consultation to match your hair texture, facial structure, skin profile, and personal lifestyle.
          </p>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#2B1E19] text-[#E0C797] shadow-sm'
                    : 'bg-white text-stone-700 border border-[#EFE8DF] hover:border-[#C5A059]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EFE8DF] rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div 
              key={service.id}
              className="bg-white rounded-xl overflow-hidden border border-[#EFE8DF] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1A110D]/80 backdrop-blur-sm text-[#E0C797] text-[11px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {service.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-stone-900 text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                    ₹{service.price}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{service.durationMinutes} mins</span>
                    <span>•</span>
                    <span className="capitalize">{service.gender}</span>
                  </div>

                  <h3 className="font-serif-luxury text-lg font-bold text-[#2B1E19] mb-2 leading-snug">
                    {service.name}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {service.addOns && service.addOns.length > 0 && (
                    <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EFE8DF] mb-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#987834] mb-1">
                        Popular Add-ons Available:
                      </div>
                      <div className="text-xs text-stone-700 truncate">
                        {service.addOns.map(a => `${a.name} (+₹${a.price})`).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleStartBooking(service)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#2B1E19] hover:bg-[#C5A059] text-[#E0C797] hover:text-[#1A110D] font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reserve Treatment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALISTS / TEAM SHOWCASE */}
      <section className="bg-[#F5EFEB] py-16 border-t border-[#EFE8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#987834]">
                World-Class Talent
              </span>
              <h2 className="font-serif-luxury text-3xl text-[#2B1E19] mt-1">
                Meet Our Master Artists
              </h2>
            </div>
            <p className="text-xs text-stone-600 max-w-md">
              Trained in London, Milan, and Tokyo, our stylists and aestheticians deliver bespoke perfection with genuine warmth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allStaff.slice(0, 4).map(stylist => (
              <div 
                key={stylist.id}
                className="bg-white rounded-xl overflow-hidden border border-[#EFE8DF] shadow-sm p-4 text-center group hover:shadow-md transition-shadow"
              >
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 border-2 border-[#C5A059]/40 group-hover:border-[#C5A059] transition-colors">
                  <img
                    src={stylist.avatar}
                    alt={stylist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="inline-flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded text-[11px] font-semibold text-[#987834] mb-1">
                  <Star className="w-3 h-3 fill-[#C5A059] text-[#C5A059]" />
                  <span>{stylist.rating}</span>
                  <span className="text-stone-400 font-normal">({stylist.reviewsCount})</span>
                </div>

                <h3 className="font-serif-luxury text-base font-bold text-[#2B1E19]">{stylist.name}</h3>
                <div className="text-xs text-[#987834] font-medium mb-3">{stylist.role}</div>

                <div className="flex flex-wrap justify-center gap-1 mb-4">
                  {stylist.specialties.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleStartBooking(undefined, stylist.id)}
                  className="w-full py-1.5 px-3 rounded bg-stone-100 hover:bg-[#2B1E19] hover:text-[#E0C797] text-stone-800 text-xs font-medium transition-colors"
                >
                  Book with {stylist.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#987834]">
            Patron Reflections
          </span>
          <h2 className="font-serif-luxury text-3xl text-[#2B1E19] mt-1">
            Loved by 15,000+ Discerning Clients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-white p-6 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#C5A059] mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A059]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed mb-4">
                  "{rev.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-[#F5EFEB]">
                <img src={rev.avatar} alt={rev.customerName} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-stone-900">{rev.customerName}</div>
                  <div className="text-[11px] text-stone-500">{rev.serviceName} • {rev.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A110D] text-white pt-12 pb-8 border-t border-[#362217] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-cinzel text-xl font-bold tracking-wider text-white mb-2">
              AURALUXE
            </div>
            <p className="text-stone-400 leading-relaxed mb-4">
              A luxury unisex salon sanctuary delivering timeless aesthetics, bespoke grooming, and clinical skin rejuvenation.
            </p>
            <div className="text-stone-500 text-[11px]">
              Jaipur • Delhi • Mumbai
            </div>
          </div>

          <div>
            <div className="font-semibold text-[#E0C797] uppercase tracking-wider mb-3">Flagship Jaipur</div>
            <p className="text-stone-300 leading-relaxed mb-2">
              Plot 14, Ashok Marg, C-Scheme<br />
              Jaipur, Rajasthan 302001
            </p>
            <p className="text-stone-400">Phone: +91 141 450 8899</p>
            <p className="text-stone-400">Daily: 09:00 AM – 09:00 PM</p>
          </div>

          <div>
            <div className="font-semibold text-[#E0C797] uppercase tracking-wider mb-3">Quick Links</div>
            <ul className="space-y-2 text-stone-300">
              <li><a href="#services-section" className="hover:text-[#C5A059]">Service Menu</a></li>
              <li><button onClick={() => handleStartBooking()} className="hover:text-[#C5A059]">Book Appointment</button></li>
              <li><button onClick={() => setIsLookupOpen(true)} className="hover:text-[#C5A059]">Track Booking</button></li>
              <li><button onClick={onOpenAdmin} className="text-[#C5A059] hover:underline font-semibold">Staff & Admin Login</button></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[#E0C797] uppercase tracking-wider mb-3">Concierge Care</div>
            <p className="text-stone-400 leading-relaxed mb-3">
              Need assistance or special bridal bookings? Our hospitality team is available on WhatsApp.
            </p>
            <a 
              href="https://wa.me/919829011223?text=Hi%20AuraLuxe,%20I%20would%20like%20to%20inquire%20about%20a%20booking" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#2B1E19] border border-[#C5A059]/40 text-[#E0C797] hover:bg-[#382620] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-[#2C1D16] flex flex-wrap items-center justify-between text-stone-500 gap-4">
          <div>
            © 2026 AuraLuxe Collective Ltd. All rights reserved. Built with Next-Gen Salon OS.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-stone-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-300 cursor-pointer">Cancellation Policy</span>
          </div>
        </div>
      </footer>

      {/* 5-STEP BOOKING MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#EFE8DF] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1A110D] text-white px-6 py-4 flex items-center justify-between border-b border-[#362217]">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-semibold">
                  Step {bookingStep} of 5
                </span>
                <h3 className="font-serif-luxury text-lg text-white font-semibold">
                  {bookingStep === 1 && 'Select Your Treatment'}
                  {bookingStep === 2 && 'Choose Your Specialist'}
                  {bookingStep === 3 && 'Pick Date & Preferred Slot'}
                  {bookingStep === 4 && 'Your Contact Details'}
                  {bookingStep === 5 && 'Appointment Confirmed!'}
                </h3>
              </div>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-[#2B1E19] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {bookingError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* STEP 1: SERVICE SELECTION */}
              {bookingStep === 1 && (
                <div className="space-y-4">
                  {/* Branch selector */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Salon Studio Location
                    </label>
                    <select
                      value={bookingBranchId}
                      onChange={(e) => setBookingBranchId(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Choose Service ({allServices.length} options)
                    </label>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {allServices.map(srv => {
                        const isSelected = selectedService?.id === srv.id;
                        return (
                          <div
                            key={srv.id}
                            onClick={() => {
                              setSelectedService(srv);
                              setSelectedAddOns([]);
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-[#C5A059] bg-[#FAF7F2] ring-1 ring-[#C5A059]'
                                : 'border-[#EFE8DF] hover:border-stone-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={srv.image} alt={srv.name} className="w-12 h-12 rounded-lg object-cover" />
                              <div>
                                <div className="font-bold text-stone-900">{srv.name}</div>
                                <div className="text-[11px] text-stone-500">
                                  {srv.category} • {srv.durationMinutes} mins
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-stone-900">₹{srv.price}</div>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-[#987834] ml-auto mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add-ons if service is selected */}
                  {selectedService?.addOns && selectedService.addOns.length > 0 && (
                    <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EFE8DF]">
                      <div className="font-semibold text-stone-800 mb-2">
                        Customize with Add-ons (Optional)
                      </div>
                      <div className="space-y-1.5">
                        {selectedService.addOns.map(addon => {
                          const isChecked = selectedAddOns.includes(addon.id);
                          return (
                            <label
                              key={addon.id}
                              className="flex items-center justify-between p-2 rounded bg-white border border-[#EFE8DF] cursor-pointer hover:border-[#C5A059]"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedAddOns(selectedAddOns.filter(id => id !== addon.id));
                                    } else {
                                      setSelectedAddOns([...selectedAddOns, addon.id]);
                                    }
                                  }}
                                  className="accent-[#C5A059] w-3.5 h-3.5"
                                />
                                <span className="text-stone-800">{addon.name}</span>
                                <span className="text-stone-400 text-[10px]">({addon.durationMinutes}m)</span>
                              </div>
                              <span className="font-bold text-stone-900">+₹{addon.price}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: SPECIALIST SELECTION */}
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <p className="text-stone-600">
                    Select your preferred artist or choose <span className="font-semibold text-stone-900">Any Available</span> for highest scheduling flexibility.
                  </p>

                  <div className="space-y-2">
                    <div
                      onClick={() => setSelectedStaffId('any')}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        selectedStaffId === 'any'
                          ? 'border-[#C5A059] bg-[#FAF7F2] ring-1 ring-[#C5A059]'
                          : 'border-[#EFE8DF] hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2B1E19] text-[#E0C797] flex items-center justify-center font-bold">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">Any Available Specialist</div>
                          <div className="text-[11px] text-stone-500">First available master artist on duty</div>
                        </div>
                      </div>
                      {selectedStaffId === 'any' && (
                        <CheckCircle className="w-4 h-4 text-[#987834]" />
                      )}
                    </div>

                    {allStaff.map(st => {
                      const isSelected = selectedStaffId === st.id;
                      return (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStaffId(st.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#C5A059] bg-[#FAF7F2] ring-1 ring-[#C5A059]'
                              : 'border-[#EFE8DF] hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={st.avatar} alt={st.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="font-bold text-stone-900">{st.name}</div>
                              <div className="text-[11px] text-stone-500">
                                {st.role} • {st.rating}★ ({st.reviewsCount} reviews)
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-[#987834]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME */}
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Available Time Slots for {bookingDate}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map(time => {
                        const isSelected = bookingTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setBookingTime(time)}
                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? 'bg-[#2B1E19] text-[#E0C797] border-[#2B1E19] shadow-sm'
                                : 'bg-white border-[#EFE8DF] text-stone-800 hover:border-[#C5A059]'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedService && (
                    <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
                      Duration: ~{selectedService.durationMinutes + (selectedAddOns.length * 15)} mins • Buffer: 10 mins allocated
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: CUSTOMER DETAILS */}
              {bookingStep === 4 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aditi Sharma"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number (for WhatsApp / SMS Reminders) *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98290 12345"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="aditi@example.com"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Special Instructions / Allergies
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Sensitive scalp, preferring ammonia-free formulation, preferred beverage..."
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-lg border border-[#C5A059]/40 mt-3">
                    <div className="text-[11px] font-semibold text-[#987834] uppercase tracking-wider mb-2">
                      Reservation Summary
                    </div>
                    <div className="flex justify-between text-stone-700 mb-1">
                      <span>{selectedService?.name}</span>
                      <span className="font-bold">₹{selectedService?.price}</span>
                    </div>
                    {selectedAddOns.length > 0 && (
                      <div className="text-stone-500 text-[11px] mb-1">
                        + {selectedAddOns.length} Add-on service(s)
                      </div>
                    )}
                    <div className="flex justify-between text-stone-700 border-t border-[#EFE8DF] pt-1.5 mt-1.5">
                      <span className="font-bold">Estimated Total (Pay at salon):</span>
                      <span className="font-bold text-stone-900 text-sm">₹{calculateBookingTotal()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CONFIRMATION */}
              {bookingStep === 5 && confirmedBooking && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h4 className="font-serif-luxury text-2xl font-bold text-stone-900">
                      Booking Confirmed!
                    </h4>
                    <p className="text-stone-600 text-xs mt-1">
                      We have reserved your appointment and sent a simulated WhatsApp reminder.
                    </p>
                  </div>

                  {/* Reference Card */}
                  <div className="bg-[#FAF7F2] border-2 border-dashed border-[#C5A059] rounded-xl p-4 max-w-sm mx-auto text-left space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-[#EFE8DF]">
                      <span className="text-[10px] uppercase font-bold text-[#987834]">Reference Code</span>
                      <span className="font-mono text-base font-bold text-stone-900">{confirmedBooking.bookingCode}</span>
                    </div>
                    <div className="text-xs text-stone-700">
                      <div><strong className="text-stone-900">Service:</strong> {confirmedBooking.serviceName}</div>
                      <div><strong className="text-stone-900">Specialist:</strong> {confirmedBooking.staffName}</div>
                      <div><strong className="text-stone-900">Date & Time:</strong> {confirmedBooking.date} at {confirmedBooking.startTime}</div>
                      <div><strong className="text-stone-900">Guest:</strong> {confirmedBooking.customerName} ({confirmedBooking.customerPhone})</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    No advance payment required. You can pay via UPI, Card, or Cash after your service.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-stone-50 px-6 py-3 border-t border-[#EFE8DF] flex items-center justify-between">
              {bookingStep > 1 && bookingStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setBookingStep((bookingStep - 1) as any)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#EFE8DF] text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {bookingStep === 1 && (
                <button
                  type="button"
                  disabled={!selectedService}
                  onClick={() => setBookingStep(2)}
                  className="px-5 py-2 rounded-lg bg-[#2B1E19] text-[#E0C797] text-xs font-semibold hover:bg-[#3D281E] disabled:opacity-50"
                >
                  Continue to Specialist
                </button>
              )}

              {bookingStep === 2 && (
                <button
                  type="button"
                  onClick={() => setBookingStep(3)}
                  className="px-5 py-2 rounded-lg bg-[#2B1E19] text-[#E0C797] text-xs font-semibold hover:bg-[#3D281E]"
                >
                  Continue to Schedule
                </button>
              )}

              {bookingStep === 3 && (
                <button
                  type="button"
                  onClick={() => setBookingStep(4)}
                  className="px-5 py-2 rounded-lg bg-[#2B1E19] text-[#E0C797] text-xs font-semibold hover:bg-[#3D281E]"
                >
                  Continue to Details
                </button>
              )}

              {bookingStep === 4 && (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="px-6 py-2 rounded-lg bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs shadow-md transition-all"
                >
                  Confirm Reservation
                </button>
              )}

              {bookingStep === 5 && (
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="px-5 py-2 rounded-lg bg-[#2B1E19] text-[#E0C797] text-xs font-semibold hover:bg-[#3D281E]"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY BOOKINGS LOOKUP DRAWER */}
      {isLookupOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DF] mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">Track My Booking</h3>
                </div>
                <button onClick={() => setIsLookupOpen(false)} className="text-stone-400 hover:text-stone-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLookupBookings} className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Enter Phone Number or Reference Code (e.g. AL-8492)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 9811233441 or AL-8492"
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                      className="flex-1 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2B1E19] text-[#E0C797] rounded-lg text-xs font-semibold hover:bg-[#3D281E]"
                    >
                      Find
                    </button>
                  </div>
                </div>
              </form>

              {lookupMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg mb-4">
                  {lookupMessage}
                </div>
              )}

              {customerBookings && customerBookings.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Found {customerBookings.length} Reservation(s)
                  </div>
                  {customerBookings.map(b => (
                    <div key={b.id} className="p-3.5 rounded-xl border border-[#EFE8DF] bg-[#FAF7F2] space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-[#987834]">{b.bookingCode}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800">
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="font-bold text-stone-900">{b.serviceName}</div>
                      <div className="text-stone-600">With {b.staffName}</div>
                      <div className="text-stone-500 flex items-center gap-2">
                        <span>📅 {b.date}</span>
                        <span>⏰ {b.startTime} - {b.endTime}</span>
                      </div>
                      <div className="text-stone-900 font-semibold pt-1 border-t border-[#EFE8DF]">
                        Total: ₹{b.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#EFE8DF] text-center">
              <button
                onClick={() => setIsLookupOpen(false)}
                className="w-full py-2 bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
