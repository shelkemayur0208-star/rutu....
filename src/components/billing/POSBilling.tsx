import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Trash2, 
  Printer, 
  QrCode, 
  Banknote, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Receipt,
  User,
  ShoppingBag,
  Percent
} from 'lucide-react';
import { salonDB } from '../../services/db';
import { Appointment, Customer, Service, Product, Invoice, PaymentMethod } from '../../types';

interface POSBillingProps {
  selectedBranchId: string;
  preselectedAppointment?: Appointment | null;
  onClearPreselectedAppointment?: () => void;
}

export const POSBilling: React.FC<POSBillingProps> = ({
  selectedBranchId,
  preselectedAppointment,
  onClearPreselectedAppointment,
}) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const allServices = salonDB.getServices();
  const allProducts = salonDB.getProducts(selectedBranchId);
  const allCustomers = salonDB.getCustomers(selectedBranchId);
  const allAppointments = salonDB.getAppointments(selectedBranchId);

  // Billing Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk_in');
  const [customCustomerName, setCustomCustomerName] = useState('Walk-in Patron');
  const [customCustomerPhone, setCustomCustomerPhone] = useState('+91 99999 00000');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');

  // Cart Items
  interface CartItem {
    type: 'service' | 'product';
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Discounts & Notes
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmountFlat, setDiscountAmountFlat] = useState(0);
  const [staffNote, setStaffNote] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [upiRefId, setUpiRefId] = useState('');

  // Receipt Modal State
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Catalog Filter
  const [catalogTab, setCatalogTab] = useState<'services' | 'products'>('services');
  const [searchCatalog, setSearchCatalog] = useState('');

  // If a preselected appointment was passed in, auto-fill it
  useEffect(() => {
    if (preselectedAppointment) {
      setSelectedAppointmentId(preselectedAppointment.id);
      setCustomCustomerName(preselectedAppointment.customerName);
      setCustomCustomerPhone(preselectedAppointment.customerPhone);

      // Check if existing customer matches
      const matchedCust = allCustomers.find(c => c.phone === preselectedAppointment.customerPhone);
      if (matchedCust) setSelectedCustomerId(matchedCust.id);

      // Add service to cart
      setCartItems([
        {
          type: 'service',
          id: preselectedAppointment.serviceId,
          name: preselectedAppointment.serviceName,
          quantity: 1,
          unitPrice: preselectedAppointment.price
        }
      ]);
    }
  }, [preselectedAppointment]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (customerId === 'walk_in') {
      setCustomCustomerName('Walk-in Patron');
      setCustomCustomerPhone('+91 99999 00000');
    } else {
      const found = allCustomers.find(c => c.id === customerId);
      if (found) {
        setCustomCustomerName(found.name);
        setCustomCustomerPhone(found.phone);

        // Auto VIP discount if applicable
        if (found.tier === 'VIP Platinum') {
          setDiscountPercent(10);
          setDiscountCode('VIP-PLATINUM-10');
        } else if (found.tier === 'Gold') {
          setDiscountPercent(5);
          setDiscountCode('GOLD-5');
        } else {
          setDiscountPercent(0);
          setDiscountCode('');
        }
      }
    }
  };

  const handleAddServiceToCart = (service: Service) => {
    const existing = cartItems.find(item => item.id === service.id && item.type === 'service');
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.id === service.id && item.type === 'service'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        type: 'service',
        id: service.id,
        name: service.name,
        quantity: 1,
        unitPrice: service.price
      }]);
    }
  };

  const handleAddProductToCart = (prod: Product) => {
    if (prod.stockQuantity <= 0) {
      alert(`${prod.name} is currently out of stock.`);
      return;
    }
    const existing = cartItems.find(item => item.id === prod.id && item.type === 'product');
    if (existing) {
      if (existing.quantity >= prod.stockQuantity) {
        alert(`Only ${prod.stockQuantity} items in stock.`);
        return;
      }
      setCartItems(cartItems.map(item => 
        item.id === prod.id && item.type === 'product'
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        type: 'product',
        id: prod.id,
        name: prod.name,
        quantity: 1,
        unitPrice: prod.sellingPrice
      }]);
    }
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    const updated = [...cartItems];
    const newQty = updated[idx].quantity + delta;
    if (newQty <= 0) {
      updated.splice(idx, 1);
    } else {
      updated[idx].quantity = newQty;
    }
    setCartItems(updated);
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = Math.min(subtotal, discountAmountFlat + (subtotal * (discountPercent / 100)));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100; // 18% GST (9% CGST + 9% SGST)
  const finalTotal = taxableAmount + taxAmount;
  const changeDue = Math.max(0, cashTendered - finalTotal);

  const handleApplyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'LUXE10' || clean === 'WELCOME10') {
      setDiscountPercent(10);
      setDiscountCode(clean);
      setDiscountAmountFlat(0);
    } else if (clean === 'FESTIVE15') {
      setDiscountPercent(15);
      setDiscountCode(clean);
      setDiscountAmountFlat(0);
    } else if (clean === 'FLAT200') {
      setDiscountAmountFlat(200);
      setDiscountPercent(0);
      setDiscountCode(clean);
    } else {
      alert('Invalid promo code. Valid demo codes: LUXE10, FESTIVE15, FLAT200');
    }
  };

  const handleGenerateInvoice = () => {
    if (cartItems.length === 0) {
      setErrorMessage('Cart is empty. Please add at least one service or retail product.');
      return;
    }

    const res = salonDB.createInvoice({
      branchId: selectedBranchId,
      customerId: selectedCustomerId,
      customerName: customCustomerName,
      customerPhone: customCustomerPhone,
      appointmentId: selectedAppointmentId || undefined,
      items: cartItems,
      discountAmount,
      discountCode: discountCode || undefined,
      paymentMethod,
      notes: staffNote || undefined
    });

    if (!res.success || !res.invoice) {
      setErrorMessage(res.error || 'Failed to generate invoice');
      return;
    }

    setCompletedInvoice(res.invoice);
    setIsReceiptModalOpen(true);
    setErrorMessage(null);

    // Reset current form
    setCartItems([]);
    setSelectedAppointmentId('');
    setDiscountCode('');
    setDiscountPercent(0);
    setDiscountAmountFlat(0);
    setStaffNote('');
    if (onClearPreselectedAppointment) onClearPreselectedAppointment();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredServices = allServices.filter(s => 
    s.name.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    s.category.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchCatalog.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchCatalog.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans-clean">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
            <span>Point of Sale Terminal</span>
            <span>•</span>
            <span>{currentBranch.name}</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
            Salon Checkout & Invoicing
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-600 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#EFE8DF]">
          <span>GSTIN:</span>
          <span className="font-mono font-bold text-stone-900">{currentBranch.gstNumber}</span>
        </div>
      </div>

      {preselectedAppointment && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>
              Checking out appointment <strong>{preselectedAppointment.bookingCode}</strong> for{' '}
              <strong>{preselectedAppointment.customerName}</strong> ({preselectedAppointment.serviceName})
            </span>
          </div>
          <button 
            onClick={() => onClearPreselectedAppointment?.()}
            className="text-blue-700 hover:text-blue-900 font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* POS SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CATALOG & ITEM SELECTOR (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#EFE8DF] shadow-sm p-5 space-y-4">
          {/* Customer Selection Row */}
          <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EFE8DF] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#C5A059]" />
                Select Customer
              </span>
              <span className="text-[11px] text-stone-500">Tier benefits apply automatically</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full p-2 bg-white border border-[#EFE8DF] rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#C5A059]"
              >
                <option value="walk_in">👤 Walk-in Patron</option>
                {allCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — {c.tier}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  className="w-1/2 p-2 bg-white border border-[#EFE8DF] rounded-lg text-xs"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customCustomerPhone}
                  onChange={(e) => setCustomCustomerPhone(e.target.value)}
                  className="w-1/2 p-2 bg-white border border-[#EFE8DF] rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Catalog Tabs & Search */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex rounded-lg bg-[#FAF7F2] p-1 border border-[#EFE8DF] text-xs">
              <button
                onClick={() => setCatalogTab('services')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  catalogTab === 'services' ? 'bg-[#2B1E19] text-[#E0C797]' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Services ({allServices.length})
              </button>
              <button
                onClick={() => setCatalogTab('products')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  catalogTab === 'products' ? 'bg-[#2B1E19] text-[#E0C797]' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Retail Products ({allProducts.length})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchCatalog}
                onChange={(e) => setSearchCatalog(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Catalog Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {catalogTab === 'services' ? (
              filteredServices.map(srv => (
                <div
                  key={srv.id}
                  onClick={() => handleAddServiceToCart(srv)}
                  className="p-3 rounded-xl border border-[#EFE8DF] bg-white hover:border-[#C5A059] cursor-pointer transition-all flex flex-col justify-between group hover:shadow-xs"
                >
                  <div className="flex gap-2.5">
                    <img src={srv.image} alt={srv.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div>
                      <div className="font-bold text-stone-900 text-xs group-hover:text-[#987834] transition-colors leading-snug">
                        {srv.name}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{srv.category} • {srv.durationMinutes}m</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5EFEB] text-xs">
                    <span className="font-bold text-stone-900">₹{srv.price}</span>
                    <span className="text-[11px] text-[#987834] font-semibold flex items-center gap-1 group-hover:underline">
                      <Plus className="w-3 h-3" /> Add Service
                    </span>
                  </div>
                </div>
              ))
            ) : (
              filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => handleAddProductToCart(prod)}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between group hover:shadow-xs ${
                    prod.stockQuantity <= 0
                      ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed'
                      : 'bg-white border-[#EFE8DF] hover:border-[#C5A059] cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono font-semibold text-stone-400">{prod.brand}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        prod.stockQuantity <= prod.reorderLevel ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Stock: {prod.stockQuantity}
                      </span>
                    </div>
                    <div className="font-bold text-stone-900 text-xs mt-1 leading-snug">{prod.name}</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">{prod.unit}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5EFEB] text-xs">
                    <span className="font-bold text-stone-900">₹{prod.sellingPrice}</span>
                    <span className="text-[11px] text-[#987834] font-semibold flex items-center gap-1 group-hover:underline">
                      <Plus className="w-3 h-3" /> Add Product
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CART & BILL SUMMARY (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#EFE8DF] shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#EFE8DF]">
            <h3 className="font-serif-luxury text-base font-bold text-[#2B1E19] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#C5A059]" />
              Current Bill ({cartItems.length} items)
            </h3>
            {cartItems.length > 0 && (
              <button 
                onClick={() => setCartItems([])}
                className="text-[11px] text-rose-600 hover:underline"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Item List */}
          {cartItems.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <span>Cart is empty. Select services or retail products from the left to begin billing.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF7F2] text-xs">
                  <div className="flex-1 pr-2">
                    <div className="font-semibold text-stone-900">{item.name}</div>
                    <div className="text-[10px] text-stone-500">
                      ₹{item.unitPrice} × {item.quantity} = ₹{item.unitPrice * item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-stone-300 rounded bg-white">
                      <button 
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => handleUpdateQuantity(idx, -item.quantity)}
                      className="text-stone-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount / Promo Box */}
          <div className="bg-[#FAF7F2] p-3 rounded-lg border border-[#EFE8DF] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#C5A059]" />
                Discount / Coupon
              </span>
              {discountPercent > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  {discountPercent}% Applied ({discountCode})
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code (e.g. LUXE10, FESTIVE15)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 p-1.5 bg-white border border-[#EFE8DF] rounded text-xs uppercase"
              />
              <button
                type="button"
                onClick={() => handleApplyPromoCode(discountCode)}
                className="px-3 py-1.5 bg-[#2B1E19] text-[#E0C797] font-semibold text-xs rounded hover:bg-[#3D281E]"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="space-y-1.5 text-xs border-t border-[#EFE8DF] pt-3 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-stone-900">₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>Taxable Amount:</span>
              <span className="font-mono">₹{taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>18% GST (9% CGST + 9% SGST):</span>
              <span className="font-mono">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
              <span>Final Payable Total:</span>
              <span className="font-mono text-base text-[#987834]">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-[#EFE8DF] text-xs">
            <label className="font-bold text-stone-800 block">Select Payment Mode</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-1 rounded-lg text-center font-medium border transition-all ${
                  paymentMethod === 'upi' ? 'bg-[#2B1E19] text-[#E0C797] border-[#2B1E19]' : 'bg-[#FAF7F2] text-stone-700 hover:border-stone-400'
                }`}
              >
                <QrCode className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px]">UPI QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-1 rounded-lg text-center font-medium border transition-all ${
                  paymentMethod === 'cash' ? 'bg-[#2B1E19] text-[#E0C797] border-[#2B1E19]' : 'bg-[#FAF7F2] text-stone-700 hover:border-stone-400'
                }`}
              >
                <Banknote className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px]">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-1 rounded-lg text-center font-medium border transition-all ${
                  paymentMethod === 'card' ? 'bg-[#2B1E19] text-[#E0C797] border-[#2B1E19]' : 'bg-[#FAF7F2] text-stone-700 hover:border-stone-400'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px]">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('net_banking')}
                className={`py-2 px-1 rounded-lg text-center font-medium border transition-all ${
                  paymentMethod === 'net_banking' ? 'bg-[#2B1E19] text-[#E0C797] border-[#2B1E19]' : 'bg-[#FAF7F2] text-stone-700 hover:border-stone-400'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[10px]">NetBanking</span>
              </button>
            </div>

            {/* UPI Dynamic QR Simulation */}
            {paymentMethod === 'upi' && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DF] flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-stone-200 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-14 h-14 text-stone-800" />
                </div>
                <div className="text-[11px] text-stone-600">
                  <div className="font-bold text-stone-900">Scan to Pay via Any UPI App</div>
                  <div>VPA: <strong className="font-mono text-stone-800">auraluxe@icici</strong></div>
                  <div className="text-[10px] text-stone-400">GPay, PhonePe, Paytm, BHIM</div>
                </div>
              </div>
            )}

            {/* Cash Tendered Calculator */}
            {paymentMethod === 'cash' && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DF] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700">Cash Received from Customer</label>
                  <input
                    type="number"
                    placeholder="e.g. 2000"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="w-28 p-1.5 bg-white border border-[#EFE8DF] rounded text-right font-mono font-bold text-xs"
                  />
                </div>
                {cashTendered > 0 && (
                  <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-[#EFE8DF]">
                    <span>Change to Return:</span>
                    <span className="font-mono text-emerald-700 text-sm">₹{changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={handleGenerateInvoice}
            className="w-full py-3 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Receipt className="w-4 h-4" />
            <span>Generate Tax Invoice & Complete Sale (₹{finalTotal.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE TAX INVOICE RECEIPT MODAL */}
      {isReceiptModalOpen && completedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#EFE8DF] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#1A110D] text-white px-6 py-4 flex items-center justify-between border-b border-[#362217]">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-semibold">Payment Completed</span>
                <h3 className="font-serif-luxury text-base text-white font-semibold">Official Salon Receipt</h3>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Printable Area */}
            <div id="printable-receipt" className="p-6 overflow-y-auto space-y-4 text-xs bg-white text-stone-900 font-sans-clean">
              {/* Salon Brand Header */}
              <div className="text-center space-y-1 pb-3 border-b-2 border-stone-900">
                <div className="font-cinzel text-xl font-bold tracking-widest text-[#1A110D]">AURALUXE</div>
                <div className="text-[10px] uppercase tracking-wider text-stone-600 font-semibold">{currentBranch.name}</div>
                <div className="text-[10px] text-stone-500">{currentBranch.address}</div>
                <div className="text-[10px] text-stone-500">Phone: {currentBranch.phone} • GSTIN: {currentBranch.gstNumber}</div>
              </div>

              {/* Invoice Meta */}
              <div className="flex justify-between items-start text-[11px] pb-2 border-b border-stone-200">
                <div>
                  <div><strong className="text-stone-800">Invoice:</strong> {completedInvoice.invoiceNumber}</div>
                  <div><strong className="text-stone-800">Date:</strong> {completedInvoice.createdAt.slice(0, 10)} {completedInvoice.createdAt.slice(11, 16)}</div>
                  <div><strong className="text-stone-800">Payment:</strong> {completedInvoice.paymentMethod.toUpperCase()} (PAID)</div>
                  {completedInvoice.upiTransactionRef && (
                    <div className="text-[10px] font-mono text-stone-500">Ref: {completedInvoice.upiTransactionRef}</div>
                  )}
                </div>
                <div className="text-right">
                  <div><strong className="text-stone-800">Patron:</strong> {completedInvoice.customerName}</div>
                  <div>{completedInvoice.customerPhone}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-300 text-[10px] uppercase text-stone-600">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Price</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {completedInvoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-1.5 font-medium">{item.name}</td>
                      <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-1.5 text-right font-mono">₹{item.unitPrice}</td>
                      <td className="py-1.5 text-right font-mono font-bold">₹{item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Breakdown */}
              <div className="space-y-1 text-xs border-t border-stone-300 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{completedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {completedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{completedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-stone-600">
                  <span>CGST (9%):</span>
                  <span className="font-mono">₹{(completedInvoice.taxAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-600">
                  <span>SGST (9%):</span>
                  <span className="font-mono">₹{(completedInvoice.taxAmount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 border-t-2 border-stone-900 pt-1.5">
                  <span>Total Paid:</span>
                  <span className="font-mono text-base">₹{completedInvoice.finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Thank you note */}
              <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[10px] text-stone-500">
                Thank you for indulging with AuraLuxe Collective! <br />
                Follow us on Instagram @auraluxesalon
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-stone-50 p-4 border-t border-[#EFE8DF] flex gap-2 justify-end">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-[#2B1E19] text-[#E0C797] font-semibold text-xs rounded-lg hover:bg-[#3D281E] flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg hover:bg-stone-300"
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
