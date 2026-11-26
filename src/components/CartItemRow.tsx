import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatINR } from '../utils/cartUtils';
import { SafeImage } from './SafeImage';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  compact?: boolean;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
}: CartItemRowProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-[#E2D9C9] last:border-b-0">
      <div
        className={`${
          compact ? 'w-16 h-16' : 'w-24 h-20'
        } shrink-0 rounded-lg overflow-hidden bg-[#F2ECE1] border border-[#E2D9C9]`}
      >
        <SafeImage
          src={item.image}
          alt={item.name}
          fallbackLabel={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[#65574D] truncate">{item.category}</p>
            <h4 className="text-sm font-semibold text-[#261D17] truncate">{item.name}</h4>
            {(item.variantName || item.materialOption) && (
              <p className="text-xs text-[#65574D] mt-0.5">
                {[item.variantName, item.materialOption].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <p className="text-sm font-semibold text-[#261D17] tabular-nums shrink-0">
            {formatINR(item.price * item.quantity)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-[#D8CBB5] rounded-lg bg-white">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="w-8 h-8 inline-flex items-center justify-center text-[#261D17] hover:bg-[#F2ECE1] rounded-l-lg transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 text-xs font-medium text-[#261D17] tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className="w-8 h-8 inline-flex items-center justify-center text-[#261D17] hover:bg-[#F2ECE1] rounded-r-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.cartItemId)}
            aria-label={`Remove ${item.name} from cart`}
            className="inline-flex items-center gap-1.5 text-xs text-[#65574D] hover:text-[#B84E32] transition-colors cursor-pointer py-1 px-2"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
