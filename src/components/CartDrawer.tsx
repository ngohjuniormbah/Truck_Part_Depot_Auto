import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const partsSubtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const coreTotal = items.reduce((acc, item) => acc + (item.product.coreDeposit || 0) * item.quantity, 0);
  const total = partsSubtotal + coreTotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen sm:max-w-md bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl text-white">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold tracking-tight">Depot Parts Cart</h2>
              <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-medium">
                {items.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 divide-y divide-neutral-900 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto text-neutral-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-neutral-300">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Browse our high-demand inventory of turbos, injectors, and transmissions for Ford, GMC, and Ram trucks.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 min-h-[44px] px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer inline-flex items-center justify-center"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3 sm:gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-lg border border-neutral-800 bg-neutral-900 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white truncate leading-tight">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="min-w-[36px] min-h-[36px] -mr-2 -mt-1 flex items-center justify-center text-neutral-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {item.product.brand} &bull; {item.product.engine}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      OEM: {item.product.oemNumber}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-neutral-700 rounded-md bg-neutral-900 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-[24px] text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 active:bg-neutral-700 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white">
                          ${(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        {item.product.coreDeposit ? (
                          <div className="text-[10px] text-neutral-400">
                            +${(item.product.coreDeposit * item.quantity).toLocaleString()} core
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-neutral-800 bg-neutral-950 space-y-3">
              {coreTotal > 0 && (
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  <strong className="text-neutral-200">Core Deposit Included:</strong> ${coreTotal.toLocaleString()} will be refunded 100% when you return your old unit in the provided prepaid box.
                </p>
              )}

              <div className="space-y-1.5 text-xs text-neutral-400 pt-1">
                <div className="flex justify-between">
                  <span>Parts Subtotal:</span>
                  <span className="text-white font-medium">${partsSubtotal.toLocaleString()}</span>
                </div>
                {coreTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Refundable Core Deposit:</span>
                    <span className="text-white font-medium">${coreTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Expedited Freight:</span>
                  <span className="text-neutral-300 font-medium">Calculated at Checkout</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Estimated Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
