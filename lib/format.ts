const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatPrice = (n: number) => inr.format(n);

export const discount = (price: number, mrp: number) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

export const CATEGORY_NAMES: Record<string, string> = {
  immunity: "Immunity",
  "stress-sleep": "Stress & Sleep",
  digestion: "Digestion",
  "skin-hair": "Skin & Hair",
  joints: "Joints & Mobility",
  heart: "Heart Care",
  "mens-wellness": "Men's Wellness",
  "womens-wellness": "Women's Wellness",
};
