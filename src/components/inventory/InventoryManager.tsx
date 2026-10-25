import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  RotateCw, 
  Truck, 
  DollarSign, 
  X,
  Minus,
  Edit2
} from 'lucide-react';
import { salonDB } from '../../services/db';
import { Product } from '../../types';

interface InventoryManagerProps {
  selectedBranchId: string;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ selectedBranchId }) => {
  const branches = salonDB.getBranches();
  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const allProducts = salonDB.getProducts(selectedBranchId);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Stock Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustMode, setAdjustMode] = useState<'restock' | 'consume'>('restock');

  // Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Hair Care');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdReorder, setNewProdReorder] = useState(5);
  const [newProdCost, setNewProdCost] = useState(1000);
  const [newProdPrice, setNewProdPrice] = useState(1800);
  const [newProdSupplier, setNewProdSupplier] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('Bottle (250ml)');

  // Metrics
  const totalProducts = allProducts.length;
  const lowStockItems = allProducts.filter(p => p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0);
  const outOfStockItems = allProducts.filter(p => p.stockQuantity === 0);
  const totalInventoryValue = allProducts.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);

  const categories = [
    'All',
    'Hair Care',
    'Skin & Face',
    'Styling & Color',
    'Beard & Grooming',
    'Tools & Consumables'
  ];

  const filteredProducts = allProducts.filter(p => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApplyStockAdjustment = () => {
    if (!selectedProduct) return;
    const delta = adjustMode === 'restock' ? adjustAmount : -adjustAmount;
    salonDB.updateProductStock(selectedProduct.id, delta);
    setSelectedProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) return;

    salonDB.createProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim().toUpperCase(),
      category: newProdCategory,
      brand: newProdBrand.trim(),
      stockQuantity: Number(newProdStock),
      reorderLevel: Number(newProdReorder),
      costPrice: Number(newProdCost),
      sellingPrice: Number(newProdPrice),
      supplier: newProdSupplier.trim() || 'Direct Supplier',
      unit: newProdUnit,
      branchId: selectedBranchId
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans-clean">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DF]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#987834]">
            <span>Inventory Logistics</span>
            <span>•</span>
            <span>{currentBranch.city} Warehouse</span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#2B1E19] font-bold mt-1">
            Product Catalogue & Stock Tracking
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Catalogued SKUs</div>
          <div className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">{totalProducts} Products</div>
          <div className="text-[11px] text-stone-400 mt-1">Retail & salon back-bar supplies</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Inventory Asset Value</div>
          <div className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">₹{totalInventoryValue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">At landed purchase cost</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/40">
          <div className="text-xs text-rose-700 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Warning
          </div>
          <div className="font-serif-luxury text-2xl font-bold text-rose-700 mt-1">{lowStockItems.length} Products</div>
          <div className="text-[11px] text-rose-600 mt-1">Below minimum reorder threshold</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#EFE8DF] shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Out of Stock</div>
          <div className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">{outOfStockItems.length} Products</div>
          <div className="text-[11px] text-stone-400 mt-1">Zero units remaining</div>
        </div>
      </div>

      {/* LOW STOCK BANNER */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Restock Action Needed:</strong> {lowStockItems.map(p => p.name).join(', ')} require urgent supplier replenishment.
            </span>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-[#EFE8DF] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#2B1E19] text-[#E0C797] font-semibold'
                  : 'bg-[#FAF7F2] text-stone-700 hover:border-stone-400 border border-[#EFE8DF]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU, brand, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-xl border border-[#EFE8DF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-stone-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Product Name & SKU</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3 text-right">Cost Price</th>
                <th className="p-3 text-right">Selling Price</th>
                <th className="p-3 text-center">In Stock</th>
                <th className="p-3">Supplier</th>
                <th className="p-3 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DF]">
              {filteredProducts.map(prod => {
                const isLow = prod.stockQuantity <= prod.reorderLevel;
                const margin = Math.round(((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100);

                return (
                  <tr key={prod.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{prod.name}</div>
                      <div className="font-mono text-[10px] text-stone-400">SKU: {prod.sku} • {prod.unit}</div>
                    </td>

                    <td className="p-3 text-stone-700">{prod.category}</td>

                    <td className="p-3 font-semibold text-stone-800">{prod.brand}</td>

                    <td className="p-3 text-right font-mono text-stone-600">₹{prod.costPrice}</td>

                    <td className="p-3 text-right font-mono font-bold text-stone-900">
                      ₹{prod.sellingPrice}
                      <span className="text-[10px] text-emerald-700 font-normal ml-1">({margin}%)</span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {prod.stockQuantity}
                      </span>
                    </td>

                    <td className="p-3 text-stone-600">{prod.supplier}</td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(prod);
                          setAdjustMode('restock');
                          setAdjustAmount(10);
                        }}
                        className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#2B1E19] hover:text-[#E0C797] border border-[#EFE8DF] rounded text-[11px] font-semibold transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EFE8DF] space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#EFE8DF]">
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">Adjust Stock</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="font-bold text-stone-900">{selectedProduct.name}</div>
              <div className="text-stone-500 text-[11px]">Current Quantity: {selectedProduct.stockQuantity} {selectedProduct.unit}</div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdjustMode('restock')}
                className={`flex-1 py-1.5 rounded-lg font-semibold border ${
                  adjustMode === 'restock' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                + Restock Received
              </button>
              <button
                type="button"
                onClick={() => setAdjustMode('consume')}
                className={`flex-1 py-1.5 rounded-lg font-semibold border ${
                  adjustMode === 'consume' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                - Record Usage
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Quantity to {adjustMode === 'restock' ? 'Add' : 'Deduct'}
              </label>
              <input
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 border rounded-lg font-mono font-bold text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#EFE8DF]">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-stone-100 rounded-lg font-semibold flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyStockAdjustment}
                className="px-4 py-2 bg-[#2B1E19] text-[#E0C797] rounded-lg font-bold flex-1"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#EFE8DF] overflow-hidden flex flex-col">
            <div className="bg-[#1A110D] text-white px-6 py-4 flex items-center justify-between border-b border-[#362217]">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C5A059] font-semibold">Inventory Catalogue</span>
                <h3 className="font-serif-luxury text-base text-white font-semibold">Add New Product / Consumable</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerastase Nutritive Shampoo"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SKU / Barcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KER-NUT-250ML"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kerastase"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin & Face">Skin & Face</option>
                    <option value="Styling & Color">Styling & Color</option>
                    <option value="Beard & Grooming">Beard & Grooming</option>
                    <option value="Tools & Consumables">Tools & Consumables</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unit Packaging</label>
                  <input
                    type="text"
                    placeholder="e.g. Bottle (250ml)"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={newProdReorder}
                    onChange={(e) => setNewProdReorder(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={newProdCost}
                    onChange={(e) => setNewProdCost(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Selling Retail Price (₹)</label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. L'Oreal Official Distributor"
                  value={newProdSupplier}
                  onChange={(e) => setNewProdSupplier(e.target.value)}
                  className="w-full p-2 bg-[#FAF7F2] border border-[#EFE8DF] rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#EFE8DF]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] hover:bg-[#987834] text-[#1A110D] font-bold rounded-lg shadow-md"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
