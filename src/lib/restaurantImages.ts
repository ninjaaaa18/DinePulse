const slugImageMap: Record<string, string> = {
  "urban-burger": "/images/restaurants/urban-burger.jpeg",
  "firegrill-kitchen": "/images/restaurants/firegrill.jpeg",
  "green-garden-cafe": "/images/restaurants/green-garden.jpeg",
  "pizza-forge": "/images/restaurants/pizza-forge.jpeg",
  "spice-route": "/images/restaurants/spice-route.jpeg",
  "fresh-bowl": "/images/restaurants/fresh-bowl.jpeg",
};

const cuisineImageMap: Record<string, string> = {
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
  "burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
  "grill": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=85",
  "grilled": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=85",
  "healthy": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85",
  "organic": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=85",
  "pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=85",
  "italian": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=85",
  "indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=85",
  "curry": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=85",
  "smoothie": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=85",
  "bowl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=85",
};

const fallbackImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=85";

function normalizeCuisine(cuisine: string): string {
  const lower = cuisine.toLowerCase();
  for (const [key] of Object.entries(cuisineImageMap)) {
    if (lower.includes(key)) return key;
  }
  return "";
}

export function getRestaurantImage(cuisine: string, slug?: string): string {
  if (slug && slugImageMap[slug]) return slugImageMap[slug];
  const key = normalizeCuisine(cuisine);
  return cuisineImageMap[key] || fallbackImage;
}

export function getRestaurantHeroImage(cuisine: string, slug?: string): string {
  if (slug && slugImageMap[slug]) return slugImageMap[slug];
  const key = normalizeCuisine(cuisine);
  const heroMap: Record<string, string> = {
    "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=85",
    "burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=85",
    "grill": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1600&q=85",
    "grilled": "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1600&q=85",
    "healthy": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=85",
    "organic": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=85",
    "pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=85",
    "italian": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=85",
    "indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=85",
    "curry": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=85",
    "smoothie": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1600&q=85",
    "bowl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1600&q=85",
  };
  return heroMap[key] || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=85";
}
