import type { Campaign } from './db';
import type { CartItem } from '@/store/cartStore';

export function isPromotionActive(
  enabled: boolean,
  startDateStr: string,
  endDateStr: string
): boolean {
  if (!enabled) return false;
  
  const now = new Date();
  
  if (startDateStr) {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    if (now < start) return false;
  }
  
  if (endDateStr) {
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    if (now > end) return false;
  }
  
  return true;
}

export function calculateBuyMoreDiscount(
  items: CartItem[],
  campaigns: Campaign[] | null
): { discountAmount: number; isActive: boolean; qualified: boolean } {
  if (!campaigns || campaigns.length === 0) return { discountAmount: 0, isActive: false, qualified: false };

  let maxDiscount = 0;
  let isActive = false;
  let qualified = false;

  const buyMoreCampaigns = campaigns.filter(c => c.type === 'buy_more' && c.isActive && isPromotionActive(true, c.startDate, c.endDate));

  if (buyMoreCampaigns.length > 0) isActive = true;

  for (const campaign of buyMoreCampaigns) {
    const minQty = campaign.minQty || 0;
    const discountPct = campaign.discountPct || 0;
    
    // Find items that match the campaign's categories
    const matchingItems = items.filter(item => {
      if (!campaign.categories || campaign.categories.length === 0) return true; // applies to all
      // If we don't have category info in cart, we can't reliably apply category specific ones.
      // But we check item.categoryId or item.category (which we will add).
      const itemCat = (item as any).category;
      if (!itemCat) return false; // Existing carts without category won't match category-specific campaigns
      return campaign.categories.includes(itemCat);
    });

    const matchingQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);
    const matchingSubtotal = matchingItems.reduce((sum, item) => sum + ((item.discountPrice ?? item.price) * item.quantity), 0);

    if (matchingQty >= minQty) {
      qualified = true;
      const discountAmount = Math.round((matchingSubtotal * discountPct) / 100);
      if (discountAmount > maxDiscount) {
        maxDiscount = discountAmount; // Apply the best discount found
      }
    }
  }

  return { discountAmount: maxDiscount, isActive, qualified };
}

export function calculateFreeDelivery(
  items: CartItem[],
  subtotalAfterDiscounts: number, // Total order subtotal
  campaigns: Campaign[] | null,
  hasFreeDeliveryProduct: boolean = false
): { isFreeDelivery: boolean; isActive: boolean; qualified: boolean } {
  if (hasFreeDeliveryProduct) {
    return { isFreeDelivery: true, isActive: true, qualified: true };
  }

  if (!campaigns || campaigns.length === 0) return { isFreeDelivery: false, isActive: false, qualified: false };

  const freeDeliveryCampaigns = campaigns.filter(c => c.type === 'free_delivery' && c.isActive && isPromotionActive(true, c.startDate, c.endDate));

  let isActive = false;
  let qualified = false;
  if (freeDeliveryCampaigns.length > 0) isActive = true;

  for (const campaign of freeDeliveryCampaigns) {
    const minOrder = campaign.minOrderAmount || 0;
    
    // Check if the order meets the min order for THIS campaign. 
    // Wait, does minOrder apply to the entire cart subtotal or just the matching categories subtotal?
    // Usually, min order applies to the matching categories subtotal!
    const matchingItems = items.filter(item => {
      if (!campaign.categories || campaign.categories.length === 0) return true;
      const itemCat = (item as any).category;
      if (!itemCat) return false;
      return campaign.categories.includes(itemCat);
    });

    const matchingSubtotal = matchingItems.reduce((sum, item) => sum + ((item.discountPrice ?? item.price) * item.quantity), 0);
    
    // We should apply the discount proportion. But actually, if they qualify, it's free delivery for the whole order?
    // Usually yes, free delivery for the whole order if they buy enough from a category.
    if (matchingSubtotal >= minOrder && matchingSubtotal > 0) {
      qualified = true;
      return { isFreeDelivery: true, isActive: true, qualified: true };
    }
  }

  return { isFreeDelivery: false, isActive, qualified };
}
