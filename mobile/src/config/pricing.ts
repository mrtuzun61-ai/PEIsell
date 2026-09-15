export function calculateListingFeeCad(itemPrice: number): number {
  if (!Number.isFinite(itemPrice) || itemPrice < 0) {
    throw new Error('Invalid item price');
  }
  if (itemPrice <= 500) return 1;
  if (itemPrice <= 1000) return 2;
  if (itemPrice <= 3000) return 3;
  return 5;
}
