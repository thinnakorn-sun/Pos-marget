'use client';

import React, { useState, useEffect } from 'react';
import { usePosStore } from '@/store/pos.store';
import { useProductStore } from '@/store/product.store';
import { useAuthStore } from '@/store/auth.store';
import { SalesService } from '@/lib/services/sales.service';
import { Search, Grid, ShoppingCart, Trash2, Minus, Plus, Edit, Banknote, Building, CheckCircle, AlertTriangle, Package, Coffee, Loader2, Receipt, Download } from 'lucide-react';

export default function PosPage() {
  const { products, categories, fetchProducts, fetchCategories } = useProductStore();
  const { cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getNetAmount, discount, setDiscount, clearCart } = usePosStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    return matchCategory && matchSearch;
  });

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const saleData = {
        cashier_id: user?.id || null,
        cashier_name: user?.name || 'ไม่ระบุ',
        subtotal: getCartTotal(),
        discount: discount,
        total: getNetAmount(),
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: Number(item.selling_price),
          total_price: Number(item.selling_price) * item.quantity,
        })),
      };

      const sale = await SalesService.create(saleData);
      setShowReceipt(sale);
      clearCart();
      // refresh products เพื่ออัปเดตสต็อก
      fetchProducts();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickDiscounts = [0, 10, 20, 50, 100];

  const handleApplyQuickDiscount = (amount: number) => {
    setDiscount(amount);
  };

  return (
    <div className="flex flex-1 overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-950">
      {/* Left Side: Product Selection (65%) */}
      <section className="w-[65%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        {/* Search */}
        <div className="p-4 bg-white dark:bg-slate-900 shadow-sm z-10">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary text-lg font-medium"
              placeholder="ค้นหาสินค้า หรือ สแกนบาร์โค้ด..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-3 flex gap-3 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            <Grid className="w-4 h-4" />
            ทั้งหมด
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <Package className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start no-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock <= product.low_stock_alert && !isOutOfStock;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product as any)}
                disabled={isOutOfStock}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm transition-all text-left flex flex-col h-56 border border-slate-100 dark:border-slate-800 ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:border-primary/50 hover:-translate-y-1'
                  } ${isLowStock ? 'ring-2 ring-red-400/30' : ''}`}
              >
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  {isOutOfStock && (
                    <div className="bg-slate-800/90 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm shadow-lg">Sold Out</div>
                  )}
                  {isLowStock && (
                    <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> {product.stock} Left
                    </div>
                  )}
                </div>

                <div className="h-32 w-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Coffee className="w-12 h-12 text-slate-200 dark:text-slate-700" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 bg-white dark:bg-slate-900">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-1">{product.category?.name ?? 'General'}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1 mb-2">{product.name}</span>
                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-xl font-black text-primary">฿{Number(product.selling_price).toLocaleString()}</span>
                    <div className="w-8 h-8 rounded-xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Right Side: Transaction Summary (35%) */}
      <aside className="w-[35%] flex flex-col bg-white dark:bg-slate-950 shadow-2xl z-20 border-l border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-black flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Order List
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Cart ID: #{new Date().getTime().toString().slice(-6)}</p>
          </div>
          <button
            onClick={clearCart}
            className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center justify-center"
            title="ล้างตะกร้า"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/10">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20 translate-y-[-10%]">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 opacity-20" />
              </div>
              <p className="font-bold text-lg">ตะกร้าว่างเปล่า</p>
              <p className="text-sm mt-1">เลือกสินค้าจากรายการเพื่อเริ่มขาย</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Coffee className="w-7 h-7 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">฿{Number(item.selling_price).toLocaleString()} / Unit</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 transition-colors shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-black text-primary text-sm">฿{(Number(item.selling_price) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Payment */}
        <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            <div className="flex justify-between text-slate-500 font-bold text-sm tracking-tight">
              <span className="uppercase tracking-widest">Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="text-slate-900 dark:text-white">฿{getCartTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-500 font-bold text-sm">
                <span className="uppercase tracking-widest flex items-center gap-2">
                  Discount
                  <Edit className="w-3.5 h-3.5 text-primary" />
                </span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary font-black">฿</span>
                  <input
                    className="w-24 text-right py-1.5 pl-5 pr-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-black focus:border-primary focus:ring-0 transition-all"
                    placeholder="0"
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Quick Discounts */}
              <div className="flex gap-2">
                {quickDiscounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleApplyQuickDiscount(amt)}
                    className={`flex-1 py-1 text-[10px] font-black rounded-lg border transition-all ${discount === amt ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-primary/30'}`}
                  >
                    {amt === 0 ? 'Clear' : `฿${amt}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-2 flex justify-between items-center border-t-2 border-dashed border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black uppercase tracking-widest text-slate-400">Net Total</span>
              <div className="text-right">
                <span className="text-base font-bold text-primary mr-2">฿</span>
                <span className="text-4xl font-black text-slate-900 dark:text-white">{getNetAmount().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-2 gap-4 my-8">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all group ${paymentMethod === 'cash'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-100 dark:border-slate-800 hover:border-primary/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${paymentMethod === 'cash' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                <Banknote className="w-6 h-6" />
              </div>
              <span className="font-black text-sm uppercase tracking-wider">Cash</span>
            </button>
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all group ${paymentMethod === 'transfer'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-100 dark:border-slate-800 hover:border-primary/50'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${paymentMethod === 'transfer' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                <Building className="w-6 h-6" />
              </div>
              <span className="font-black text-sm uppercase tracking-wider">Transfer</span>
            </button>
          </div>

          {/* Final Action */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/40 hover:bg-primary/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
                COMPLETE ORDER
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Receipt Modal - ปรับโฉมใหม่ให้เหมือนกระดาษใบเสร็จจริง */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh] relative animate-in zoom-in-95 duration-300">
            {/* Serrated Edge Top */}
            <div className="h-4 w-full bg-[#f8f9fa] flex gap-2 overflow-hidden items-center justify-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-white rotate-45 transform -translate-y-2 shrink-0"></div>
              ))}
            </div>

            <div className="p-8 pb-4 text-center">
              <div className="mb-4 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">POS MARKET</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store Management System</p>
              </div>

              <div className="space-y-1 mt-4">
                <div className="text-xs font-bold uppercase">Tax Invoice / Receipt</div>
                <div className="text-[10px] text-slate-500 font-mono">{showReceipt.receipt_number}</div>
              </div>
            </div>

            <div className="px-8 flex-1 overflow-y-auto font-mono text-xs space-y-6 scrollbar-hide">
              <div className="border-t-2 border-slate-900 pt-4 space-y-1">
                <div className="flex justify-between"><span>DATE:</span><span>{new Date(showReceipt.created_at).toLocaleString('th-TH')}</span></div>
                <div className="flex justify-between"><span>CASHIER:</span><span>{showReceipt.cashier_name}</span></div>
                <div className="flex justify-between"><span>PAYMENT:</span><span className="font-bold uppercase">{showReceipt.payment_method}</span></div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2 flex justify-between font-bold text-[10px]">
                  <span>DESCRIPTION</span>
                  <div className="flex gap-8">
                    <span>QTY</span>
                    <span>AMOUNT</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {showReceipt.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="flex-1 uppercase text-[10px] font-medium leading-tight">{item.product_name}</div>
                      <div className="flex gap-8 tabular-nums">
                        <span>{item.quantity}</span>
                        <span className="font-bold">฿{Number(item.total_price).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between font-bold"><span>SUBTOTAL</span><span>฿{Number(showReceipt.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                {Number(showReceipt.discount) > 0 && (
                  <div className="flex justify-between italic"><span>DISCOUNT</span><span>-฿{Number(showReceipt.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                )}
                <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-slate-900 border-double">
                  <span>TOTAL</span>
                  <span>฿{Number(showReceipt.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="text-center space-y-4 py-6 border-b-2 border-dashed border-slate-200">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-10 bg-slate-900 flex items-center justify-center text-white font-mono text-xs tracking-[0.4em] overflow-hidden">
                    {showReceipt.receipt_number.replaceAll('-', '')}
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Order ID Signature</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase">Thank you for your visit!</p>
                  <p className="text-slate-400 text-[9px] mt-1">Visit us again at pos-marget.vercel.app</p>
                </div>
              </div>
            </div>

            <div className="p-8 pt-4">
              <button
                onClick={() => setShowReceipt(null)}
                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle className="w-4 h-4" />
                Close Receipt
              </button>
              <div className="mt-4 flex justify-center gap-4">
                <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase flex items-center gap-1.5 transition-colors">
                  <Edit className="w-3 h-3" /> Print
                </button>
                <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase flex items-center gap-1.5 transition-colors">
                  <Download className="w-3 h-3" /> PDF
                </button>
              </div>
            </div>

            {/* Serrated Edge Bottom */}
            <div className="h-4 w-full bg-[#f8f9fa] flex gap-2 overflow-hidden items-end justify-center">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-white rotate-45 transform translate-y-2 shrink-0"></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
