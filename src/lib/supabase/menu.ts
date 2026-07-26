import { getMenuItems, getRestaurants, upsertMenuItem, upsertRestaurant } from "./db";
import type { MenuItemRow, RestaurantRow } from "./types";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sugar: number;
  sodium: number;
  allergens: string[];
  image: string;
  badge: string;
  badgeIcon: string;
};

export type Restaurant = {
  id: string;
  slug?: string;
  name: string;
  cuisine: string;
  description: string;
  deliveryTime: string;
  logo: string;
  items: MenuItem[];
};

// Fallback Hardcoded Restaurant Data (Preserves 100% offline compatibility)
export const fallbackRestaurants: Restaurant[] = [
  {
    id: "burger-hub",
    slug: "burger-hub",
    name: "Burger Hub",
    cuisine: "American Grill",
    description: "Classic burgers with balanced sides and premium toppings.",
    deliveryTime: "18–25 min",
    logo: "🍔",
    items: [
      {
        id: "smoke-burger",
        name: "Smoky Stack Burger",
        price: 249,
        calories: 740,
        protein: 34,
        carbohydrates: 58,
        fat: 36,
        sugar: 12,
        sodium: 920,
        allergens: ["Gluten", "Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "avocado-blt",
        name: "Avocado Crunch Burger",
        price: 279,
        calories: 690,
        protein: 31,
        carbohydrates: 54,
        fat: 33,
        sugar: 9,
        sodium: 860,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "loaded-fries",
        name: "Crispy Loaded Fries",
        price: 149,
        calories: 520,
        protein: 12,
        carbohydrates: 62,
        fat: 24,
        sugar: 2,
        sodium: 730,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1576107232684-2f0f8d0456f1?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "grill-chicken-bowl",
        name: "Grill Chicken Bowl",
        price: 219,
        calories: 610,
        protein: 41,
        carbohydrates: 49,
        fat: 21,
        sugar: 8,
        sodium: 760,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "mint-lemonade",
        name: "Mint Lemonade",
        price: 89,
        calories: 170,
        protein: 1,
        carbohydrates: 41,
        fat: 0,
        sugar: 35,
        sodium: 85,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
    ],
  },
  {
    id: "green-bowl",
    slug: "green-bowl",
    name: "Green Bowl",
    cuisine: "Organic Salads & Protein",
    description: "Fresh greens, whole grains, and nutrient-packed bowls.",
    deliveryTime: "15–20 min",
    logo: "🥗",
    items: [
      {
        id: "green-protein-bowl",
        name: "Green Protein Bowl",
        price: 199,
        calories: 560,
        protein: 37,
        carbohydrates: 42,
        fat: 22,
        sugar: 7,
        sodium: 680,
        allergens: ["Sesame"],
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "super-salad-wrap",
        name: "Super Salad Wrap",
        price: 179,
        calories: 480,
        protein: 24,
        carbohydrates: 38,
        fat: 20,
        sugar: 6,
        sodium: 590,
        allergens: ["Gluten", "Sesame"],
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "harvest-soup",
        name: "Harvest Soup Cup",
        price: 129,
        calories: 260,
        protein: 9,
        carbohydrates: 30,
        fat: 10,
        sugar: 8,
        sodium: 540,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "sea-salt-kale",
        name: "Sea Salt Kale Chips",
        price: 119,
        calories: 220,
        protein: 4,
        carbohydrates: 18,
        fat: 14,
        sugar: 3,
        sodium: 420,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "berry-boost",
        name: "Berry Boost Smoothie",
        price: 149,
        calories: 290,
        protein: 11,
        carbohydrates: 44,
        fat: 8,
        sugar: 28,
        sodium: 120,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "grain-power-plate",
        name: "Grain Power Plate",
        price: 229,
        calories: 640,
        protein: 29,
        carbohydrates: 71,
        fat: 24,
        sugar: 9,
        sodium: 710,
        allergens: ["Sesame"],
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
    ],
  },
  {
    id: "italian-kitchen",
    slug: "italian-kitchen",
    name: "Italian Kitchen",
    cuisine: "Mediterranean Pasta",
    description: "Comforting pasta dishes and artisan flatbreads.",
    deliveryTime: "20–30 min",
    logo: "🍝",
    items: [
      {
        id: "margherita-pasta",
        name: "Margherita Pasta",
        price: 239,
        calories: 720,
        protein: 26,
        carbohydrates: 94,
        fat: 28,
        sugar: 8,
        sodium: 860,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "pesto-penne",
        name: "Pesto Penne Bowl",
        price: 269,
        calories: 780,
        protein: 24,
        carbohydrates: 81,
        fat: 35,
        sugar: 7,
        sodium: 770,
        allergens: ["Gluten", "Milk", "Tree Nuts"],
        image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "caprese-flatbread",
        name: "Caprese Flatbread",
        price: 199,
        calories: 660,
        protein: 21,
        carbohydrates: 72,
        fat: 30,
        sugar: 6,
        sodium: 740,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "tomato-basil-soup",
        name: "Tomato Basil Soup",
        price: 129,
        calories: 230,
        protein: 7,
        carbohydrates: 30,
        fat: 9,
        sugar: 10,
        sodium: 610,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "tiramisu-cup",
        name: "Tiramisu Cup",
        price: 159,
        calories: 310,
        protein: 6,
        carbohydrates: 39,
        fat: 14,
        sugar: 23,
        sodium: 120,
        allergens: ["Gluten", "Egg", "Milk"],
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "truffle-gnocchi",
        name: "Truffle Gnocchi",
        price: 289,
        calories: 850,
        protein: 20,
        carbohydrates: 108,
        fat: 39,
        sugar: 9,
        sodium: 890,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
    ],
  },
  {
    id: "south-spice",
    slug: "south-spice",
    name: "South Spice",
    cuisine: "Indian Street Food",
    description: "Spiced curries, rice plates, and vibrant appetizers.",
    deliveryTime: "22–28 min",
    logo: "🍛",
    items: [
      {
        id: "tandoori-platter",
        name: "Tandoori Platter",
        price: 269,
        calories: 710,
        protein: 39,
        carbohydrates: 52,
        fat: 32,
        sugar: 7,
        sodium: 780,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "coconut-curry",
        name: "Coconut Curry Bowl",
        price: 229,
        calories: 670,
        protein: 24,
        carbohydrates: 61,
        fat: 29,
        sugar: 9,
        sodium: 690,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Chef Recommended",
        badgeIcon: "⭐",
      },
      {
        id: "chili-naan",
        name: "Chili Garlic Naan",
        price: 119,
        calories: 280,
        protein: 8,
        carbohydrates: 42,
        fat: 8,
        sugar: 4,
        sodium: 560,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=900&q=80",
        badge: "🆕 New Item",
        badgeIcon: "🆕",
      },
      {
        id: "mint-chutney-wrap",
        name: "Mint Chutney Wrap",
        price: 169,
        calories: 430,
        protein: 19,
        carbohydrates: 39,
        fat: 18,
        sugar: 5,
        sodium: 620,
        allergens: ["Gluten"],
        image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
      {
        id: "masala-fries",
        name: "Masala Fries",
        price: 129,
        calories: 500,
        protein: 8,
        carbohydrates: 58,
        fat: 24,
        sugar: 2,
        sodium: 760,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Most Popular",
        badgeIcon: "🔥",
      },
      {
        id: "mango-lassi",
        name: "Mango Lassi",
        price: 109,
        calories: 320,
        protein: 10,
        carbohydrates: 44,
        fat: 12,
        sugar: 31,
        sodium: 180,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Healthy Choice",
        badgeIcon: "🥗",
      },
    ],
  },
];

function mapRowToMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    calories: Number(row.calories ?? 0),
    protein: Number(row.protein ?? 0),
    carbohydrates: Number(row.carbohydrates ?? 0),
    fat: Number(row.fat ?? 0),
    sugar: Number(row.sugar ?? 0),
    sodium: Number(row.sodium ?? 0),
    allergens: row.allergens && row.allergens.length > 0 ? row.allergens : ["None"],
    image: row.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    badge: row.badge || "⭐ Chef Recommended",
    badgeIcon: row.badge_icon || "⭐",
  };
}

function mapRowToRestaurant(row: RestaurantRow, items: MenuItem[] = []): Restaurant {
  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name,
    cuisine: row.cuisine || "Multi-Cuisine",
    description: row.description || "",
    deliveryTime: row.delivery_time || "20–30 min",
    logo: row.logo || "🍴",
    items,
  };
}

/**
 * Seeds restaurants and menu items tables if empty.
 */
async function seedDatabaseIfEmpty(): Promise<boolean> {
  try {
    for (const rest of fallbackRestaurants) {
      const { data: createdRest, error: restErr } = await upsertRestaurant({
        slug: rest.slug || rest.id,
        name: rest.name,
        cuisine: rest.cuisine,
        description: rest.description,
        delivery_time: rest.deliveryTime,
        logo: rest.logo,
        health_score: 92,
        is_active: true,
      });

      if (createdRest && !restErr) {
        for (const item of rest.items) {
          await upsertMenuItem({
            restaurant_id: createdRest.id,
            slug: item.id,
            name: item.name,
            price: item.price,
            calories: item.calories,
            protein: item.protein,
            carbohydrates: item.carbohydrates,
            fat: item.fat,
            sugar: item.sugar,
            sodium: item.sodium,
            allergens: item.allergens,
            image: item.image,
            badge: item.badge,
            badge_icon: item.badgeIcon,
            wellness_score: 88,
            is_available: true,
          });
        }
      }
    }
    return true;
  } catch (err) {
    console.warn("[Menu Seed] Error seeding database:", err);
    return false;
  }
}

/**
 * Fetches all restaurants from Supabase. Seeds database if empty.
 */
export async function fetchRestaurantsFromSupabase(): Promise<Restaurant[] | null> {
  try {
    const { data, error } = await getRestaurants();
    if (error) {
      console.warn("[Supabase Menu] Failed to fetch restaurants, fallback active:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((r) => mapRowToRestaurant(r));
    }

    // Seed database if empty
    const seeded = await seedDatabaseIfEmpty();
    if (seeded) {
      const { data: fresh } = await getRestaurants();
      if (fresh && fresh.length > 0) {
        return fresh.map((r) => mapRowToRestaurant(r));
      }
    }

    return null;
  } catch (err) {
    console.warn("[Supabase Menu] Exception on fetching restaurants, fallback active:", err);
    return null;
  }
}

/**
 * Fetches menu items for a specific restaurant ID (or slug) from Supabase.
 */
export async function fetchMenuItemsFromSupabase(
  restaurantId: string
): Promise<MenuItem[] | null> {
  try {
    const { data, error } = await getMenuItems(restaurantId);
    if (error) {
      console.warn("[Supabase Menu] Failed to fetch menu items, fallback active:", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(mapRowToMenuItem);
    }

    return null;
  } catch (err) {
    console.warn("[Supabase Menu] Exception on fetching menu items, fallback active:", err);
    return null;
  }
}

/**
 * Loads all restaurants with fallback to hardcoded data.
 */
export async function loadRestaurantsWithFallback(): Promise<Restaurant[]> {
  const remoteRestaurants = await fetchRestaurantsFromSupabase();
  if (remoteRestaurants && remoteRestaurants.length > 0) {
    return remoteRestaurants;
  }
  return fallbackRestaurants;
}

/**
 * Loads menu items for a selected restaurant with fallback to local items.
 */
export async function loadMenuItemsWithFallback(
  selectedRestaurantId: string,
  fallbackItems: MenuItem[]
): Promise<MenuItem[]> {
  const remoteItems = await fetchMenuItemsFromSupabase(selectedRestaurantId);
  if (remoteItems && remoteItems.length > 0) {
    return remoteItems;
  }
  return fallbackItems;
}
