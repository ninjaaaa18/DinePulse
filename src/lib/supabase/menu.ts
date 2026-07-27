import { getMenuItems, getRestaurants, upsertMenuItem, upsertRestaurant } from "./db";
import type { MenuItemRow, RestaurantRow } from "./types";
import { seedDatabaseIfEmpty } from "./seed";
import { supabase } from "./client";

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
  description?: string;
  wellnessScore?: number;
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
  healthScore?: number;
};

// Fallback Hardcoded Restaurant Data with Valid UUIDs
export const fallbackRestaurants: Restaurant[] = [
  {
    id: "11111111-1111-4111-a111-111111111111",
    slug: "urban-burger",
    name: "Urban Burger",
    cuisine: "Burgers & Fast Food",
    description: "Gourmet handcrafted burgers with crispy sides and signature dips.",
    deliveryTime: "15–22 min",
    logo: "🍔",
    items: [
      {
        id: "classic-burger",
        name: "Classic Burger",
        price: 199,
        calories: 620,
        protein: 28,
        carbohydrates: 48,
        fat: 26,
        sugar: 8,
        sodium: 780,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Bestseller",
        badgeIcon: "⭐",
      },
      {
        id: "double-cheese-burger",
        name: "Double Cheese Burger",
        price: 279,
        calories: 810,
        protein: 42,
        carbohydrates: 52,
        fat: 44,
        sugar: 10,
        sodium: 1050,
        allergens: ["Gluten", "Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80",
        badge: "🧀 Cheese Lovers",
        badgeIcon: "🧀",
      },
      {
        id: "bbq-burger",
        name: "BBQ Burger",
        price: 249,
        calories: 740,
        protein: 34,
        carbohydrates: 58,
        fat: 34,
        sugar: 16,
        sodium: 920,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Smoky Special",
        badgeIcon: "🔥",
      },
      {
        id: "chicken-burger",
        name: "Chicken Burger",
        price: 229,
        calories: 680,
        protein: 36,
        carbohydrates: 54,
        fat: 30,
        sugar: 9,
        sodium: 840,
        allergens: ["Gluten", "Egg"],
        image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?auto=format&fit=crop&w=900&q=80",
        badge: "🍗 Crispy Classic",
        badgeIcon: "🍗",
      },
      {
        id: "veg-burger",
        name: "Veg Burger",
        price: 179,
        calories: 520,
        protein: 18,
        carbohydrates: 62,
        fat: 20,
        sugar: 7,
        sodium: 650,
        allergens: ["Gluten"],
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
        badge: "🌱 Plant Based",
        badgeIcon: "🌱",
      },
      {
        id: "loaded-fries",
        name: "Loaded Fries",
        price: 169,
        calories: 580,
        protein: 14,
        carbohydrates: 68,
        fat: 28,
        sugar: 5,
        sodium: 890,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1576107232684-2f0f8d0456f1?auto=format&fit=crop&w=900&q=80",
        badge: "🍟 Popular Side",
        badgeIcon: "🍟",
      },
      {
        id: "peri-peri-fries",
        name: "Peri Peri Fries",
        price: 139,
        calories: 440,
        protein: 8,
        carbohydrates: 56,
        fat: 20,
        sugar: 3,
        sodium: 720,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=900&q=80",
        badge: "🌶️ Spicy Dip",
        badgeIcon: "🌶️",
      },
      {
        id: "onion-rings",
        name: "Onion Rings",
        price: 129,
        calories: 390,
        protein: 6,
        carbohydrates: 46,
        fat: 18,
        sugar: 6,
        sodium: 580,
        allergens: ["Gluten"],
        image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
        badge: "🧅 Crunchy Bite",
        badgeIcon: "🧅",
      },
      {
        id: "cola",
        name: "Cola",
        price: 59,
        calories: 140,
        protein: 0,
        carbohydrates: 36,
        fat: 0,
        sugar: 36,
        sodium: 40,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
        badge: "🥤 Soft Drink",
        badgeIcon: "🥤",
      },
      {
        id: "chocolate-brownie",
        name: "Chocolate Brownie",
        price: 149,
        calories: 410,
        protein: 6,
        carbohydrates: 52,
        fat: 20,
        sugar: 36,
        sodium: 180,
        allergens: ["Gluten", "Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
        badge: "🍫 Fudgy Dark",
        badgeIcon: "🍫",
      },
    ],
  },
  {
    id: "22222222-2222-4222-a222-222222222222",
    slug: "firegrill-kitchen",
    name: "FireGrill Kitchen",
    cuisine: "American Grill",
    description: "Flame-grilled steaks, smoky wings, and artisan sandwiches.",
    deliveryTime: "20–28 min",
    logo: "🔥",
    items: [
      {
        id: "grilled-chicken",
        name: "Grilled Chicken",
        price: 299,
        calories: 510,
        protein: 48,
        carbohydrates: 12,
        fat: 18,
        sugar: 3,
        sodium: 640,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80",
        badge: "💪 High Protein",
        badgeIcon: "💪",
      },
      {
        id: "bbq-wings",
        name: "BBQ Wings",
        price: 259,
        calories: 620,
        protein: 38,
        carbohydrates: 24,
        fat: 32,
        sugar: 14,
        sodium: 880,
        allergens: ["Soy"],
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 Chef Choice",
        badgeIcon: "🔥",
      },
      {
        id: "steak-sandwich",
        name: "Steak Sandwich",
        price: 329,
        calories: 730,
        protein: 44,
        carbohydrates: 54,
        fat: 34,
        sugar: 8,
        sodium: 960,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
        badge: "🥩 Signature Steak",
        badgeIcon: "🥩",
      },
      {
        id: "crispy-chicken",
        name: "Crispy Chicken",
        price: 269,
        calories: 690,
        protein: 36,
        carbohydrates: 48,
        fat: 36,
        sugar: 5,
        sodium: 820,
        allergens: ["Gluten", "Egg"],
        image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=900&q=80",
        badge: "🍗 House Special",
        badgeIcon: "🍗",
      },
      {
        id: "garlic-bread-fg",
        name: "Garlic Bread",
        price: 129,
        calories: 340,
        protein: 9,
        carbohydrates: 42,
        fat: 14,
        sugar: 3,
        sodium: 510,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=900&q=80",
        badge: "🧄 Herb Butter",
        badgeIcon: "🧄",
      },
      {
        id: "lemon-soda",
        name: "Lemon Soda",
        price: 69,
        calories: 90,
        protein: 0,
        carbohydrates: 22,
        fat: 0,
        sugar: 22,
        sodium: 180,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
        badge: "🍋 Sparkling",
        badgeIcon: "🍋",
      },
      {
        id: "chocolate-sundae",
        name: "Chocolate Sundae",
        price: 169,
        calories: 480,
        protein: 8,
        carbohydrates: 64,
        fat: 22,
        sugar: 52,
        sodium: 210,
        allergens: ["Milk", "Nuts"],
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80",
        badge: "🍨 Fudge Delight",
        badgeIcon: "🍨",
      },
    ],
  },
  {
    id: "33333333-3333-4333-a333-333333333333",
    slug: "green-garden-cafe",
    name: "Green Garden Café",
    cuisine: "Healthy Meals & Salads",
    description: "Nutrient-packed crisp salads, avocado toasts, and wholesome wraps.",
    deliveryTime: "15–20 min",
    logo: "🥗",
    items: [
      {
        id: "caesar-salad",
        name: "Caesar Salad",
        price: 219,
        calories: 380,
        protein: 24,
        carbohydrates: 18,
        fat: 22,
        sugar: 4,
        sodium: 490,
        allergens: ["Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        badge: "🥗 Clean Eating",
        badgeIcon: "🥗",
      },
      {
        id: "greek-salad",
        name: "Greek Salad",
        price: 239,
        calories: 340,
        protein: 14,
        carbohydrates: 16,
        fat: 24,
        sugar: 6,
        sodium: 520,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
        badge: "🌿 Low Calorie",
        badgeIcon: "🌿",
      },
      {
        id: "avocado-toast",
        name: "Avocado Toast",
        price: 249,
        calories: 410,
        protein: 12,
        carbohydrates: 38,
        fat: 22,
        sugar: 4,
        sodium: 380,
        allergens: ["Gluten"],
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
        badge: "🥑 Superfood",
        badgeIcon: "🥑",
      },
      {
        id: "veg-wrap",
        name: "Veg Wrap",
        price: 189,
        calories: 460,
        protein: 16,
        carbohydrates: 54,
        fat: 18,
        sugar: 6,
        sodium: 480,
        allergens: ["Gluten"],
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80",
        badge: "🌱 Wholesome",
        badgeIcon: "🌱",
      },
      {
        id: "fruit-bowl",
        name: "Fruit Bowl",
        price: 149,
        calories: 210,
        protein: 4,
        carbohydrates: 48,
        fat: 2,
        sugar: 36,
        sodium: 30,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80",
        badge: "🍓 Antioxidants",
        badgeIcon: "🍓",
      },
      {
        id: "fresh-lime-juice",
        name: "Fresh Lime Juice",
        price: 79,
        calories: 80,
        protein: 1,
        carbohydrates: 20,
        fat: 0,
        sugar: 18,
        sodium: 15,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
        badge: "🍋 Cold Pressed",
        badgeIcon: "🍋",
      },
      {
        id: "fruit-cup",
        name: "Fruit Cup",
        price: 119,
        calories: 140,
        protein: 2,
        carbohydrates: 32,
        fat: 1,
        sugar: 26,
        sodium: 15,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
        badge: "🍊 Fresh Cut",
        badgeIcon: "🍊",
      },
    ],
  },
  {
    id: "44444444-4444-4444-a444-444444444444",
    slug: "pizza-forge",
    name: "Pizza Forge",
    cuisine: "Pizza & Italian",
    description: "Hand-tossed wood-fired pizzas with artisanal cheeses and fresh herbs.",
    deliveryTime: "22–30 min",
    logo: "🍕",
    items: [
      {
        id: "margherita-pizza",
        name: "Margherita Pizza",
        price: 299,
        calories: 780,
        protein: 32,
        carbohydrates: 92,
        fat: 30,
        sugar: 8,
        sodium: 940,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ Classic Italian",
        badgeIcon: "⭐",
      },
      {
        id: "farmhouse-pizza",
        name: "Farmhouse Pizza",
        price: 349,
        calories: 820,
        protein: 28,
        carbohydrates: 98,
        fat: 32,
        sugar: 10,
        sodium: 890,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=900&q=80",
        badge: "🥦 Veggie Loaded",
        badgeIcon: "🥦",
      },
      {
        id: "veg-supreme",
        name: "Veg Supreme",
        price: 379,
        calories: 860,
        protein: 30,
        carbohydrates: 102,
        fat: 34,
        sugar: 11,
        sodium: 960,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
        badge: "🌶️ Supreme Feast",
        badgeIcon: "🌶️",
      },
      {
        id: "pepper-deluxe",
        name: "Pepper Deluxe",
        price: 399,
        calories: 910,
        protein: 38,
        carbohydrates: 94,
        fat: 40,
        sugar: 9,
        sodium: 1120,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80",
        badge: "🍕 Meat Lovers",
        badgeIcon: "🍕",
      },
      {
        id: "bbq-chicken-pizza",
        name: "BBQ Chicken Pizza",
        price: 419,
        calories: 940,
        protein: 42,
        carbohydrates: 96,
        fat: 38,
        sugar: 16,
        sodium: 1180,
        allergens: ["Gluten", "Milk", "Soy"],
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
        badge: "🔥 BBQ Roast",
        badgeIcon: "🔥",
      },
      {
        id: "garlic-bread-pf",
        name: "Garlic Bread",
        price: 139,
        calories: 360,
        protein: 10,
        carbohydrates: 44,
        fat: 16,
        sugar: 3,
        sodium: 540,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=900&q=80",
        badge: "🧄 Crunchy Crust",
        badgeIcon: "🧄",
      },
      {
        id: "cheese-sticks",
        name: "Cheese Sticks",
        price: 169,
        calories: 440,
        protein: 16,
        carbohydrates: 38,
        fat: 24,
        sugar: 4,
        sodium: 680,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=900&q=80",
        badge: "🧀 Gooey Cheese",
        badgeIcon: "🧀",
      },
      {
        id: "cheese-cake",
        name: "Cheese Cake",
        price: 199,
        calories: 450,
        protein: 8,
        carbohydrates: 46,
        fat: 26,
        sugar: 32,
        sodium: 280,
        allergens: ["Gluten", "Milk", "Egg"],
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
        badge: "🍰 New York Style",
        badgeIcon: "🍰",
      },
    ],
  },
  {
    id: "55555555-5555-4555-a555-555555555555",
    slug: "spice-route",
    name: "Spice Route",
    cuisine: "Indian",
    description: "Authentic aromatic curries, royal biryanis, and tandoori naans.",
    deliveryTime: "25–35 min",
    logo: "🍛",
    items: [
      {
        id: "paneer-butter-masala",
        name: "Paneer Butter Masala",
        price: 289,
        calories: 580,
        protein: 22,
        carbohydrates: 26,
        fat: 38,
        sugar: 12,
        sodium: 760,
        allergens: ["Milk", "Tree Nuts"],
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
        badge: "👑 Royal Classic",
        badgeIcon: "👑",
      },
      {
        id: "butter-chicken",
        name: "Butter Chicken",
        price: 319,
        calories: 640,
        protein: 38,
        carbohydrates: 22,
        fat: 40,
        sugar: 10,
        sodium: 840,
        allergens: ["Milk", "Tree Nuts"],
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=900&q=80",
        badge: "⭐ House Favorite",
        badgeIcon: "⭐",
      },
      {
        id: "veg-biryani",
        name: "Veg Biryani",
        price: 249,
        calories: 490,
        protein: 14,
        carbohydrates: 78,
        fat: 14,
        sugar: 6,
        sodium: 620,
        allergens: ["Milk", "Tree Nuts"],
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
        badge: "🍚 Fragrant Basmati",
        badgeIcon: "🍚",
      },
      {
        id: "chicken-biryani",
        name: "Chicken Biryani",
        price: 299,
        calories: 610,
        protein: 34,
        carbohydrates: 74,
        fat: 20,
        sugar: 5,
        sodium: 780,
        allergens: ["Milk", "Tree Nuts"],
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
        badge: "🍗 Dum Special",
        badgeIcon: "🍗",
      },
      {
        id: "garlic-naan",
        name: "Garlic Naan",
        price: 69,
        calories: 260,
        protein: 7,
        carbohydrates: 42,
        fat: 8,
        sugar: 2,
        sodium: 340,
        allergens: ["Gluten", "Milk"],
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
        badge: "🫓 Clay Oven",
        badgeIcon: "🫓",
      },
      {
        id: "mango-shake",
        name: "Mango Shake",
        price: 139,
        calories: 320,
        protein: 8,
        carbohydrates: 48,
        fat: 10,
        sugar: 42,
        sodium: 140,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
        badge: "🥭 Thick Shake",
        badgeIcon: "🥭",
      },
    ],
  },
  {
    id: "66666666-6666-4666-a666-666666666666",
    slug: "fresh-bowl",
    name: "Fresh Bowl",
    cuisine: "Healthy Bowls & Juices",
    description: "Power-packed quinoa bowls, paneer protein bowls, and fresh cold-pressed juices.",
    deliveryTime: "12–20 min",
    logo: "🥣",
    items: [
      {
        id: "buddha-bowl",
        name: "Buddha Bowl",
        price: 259,
        calories: 420,
        protein: 18,
        carbohydrates: 54,
        fat: 16,
        sugar: 8,
        sodium: 360,
        allergens: ["Sesame"],
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        badge: "🌱 Superfood",
        badgeIcon: "🌱",
      },
      {
        id: "paneer-bowl",
        name: "Paneer Bowl",
        price: 269,
        calories: 490,
        protein: 26,
        carbohydrates: 42,
        fat: 22,
        sugar: 7,
        sodium: 480,
        allergens: ["Milk"],
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
        badge: "🧀 High Protein",
        badgeIcon: "🧀",
      },
      {
        id: "chicken-bowl",
        name: "Chicken Bowl",
        price: 289,
        calories: 520,
        protein: 42,
        carbohydrates: 38,
        fat: 18,
        sugar: 5,
        sodium: 540,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=900&q=80",
        badge: "💪 Lean Fitness",
        badgeIcon: "💪",
      },
      {
        id: "quinoa-bowl",
        name: "Quinoa Bowl",
        price: 249,
        calories: 390,
        protein: 16,
        carbohydrates: 52,
        fat: 14,
        sugar: 6,
        sodium: 320,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=900&q=80",
        badge: "🌾 Whole Grain",
        badgeIcon: "🌾",
      },
      {
        id: "protein-bowl",
        name: "Protein Bowl",
        price: 299,
        calories: 560,
        protein: 46,
        carbohydrates: 36,
        fat: 20,
        sugar: 4,
        sodium: 580,
        allergens: ["Egg"],
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
        badge: "⚡ Power Boost",
        badgeIcon: "⚡",
      },
      {
        id: "orange-juice",
        name: "Orange Juice",
        price: 99,
        calories: 110,
        protein: 2,
        carbohydrates: 26,
        fat: 0,
        sugar: 20,
        sodium: 5,
        allergens: ["None"],
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80",
        badge: "🍊 Vitamin C",
        badgeIcon: "🍊",
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
 * Fetches all restaurants from Supabase. Seeds database if empty.
 */
export async function fetchRestaurantsFromSupabase(): Promise<Restaurant[] | null> {
  try {
    await seedDatabaseIfEmpty();

    const productionSlugs = [
      "urban-burger",
      "firegrill-kitchen",
      "green-garden-cafe",
      "pizza-forge",
      "spice-route",
      "fresh-bowl",
    ];

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .in("slug", productionSlugs);

    if (error) {
      console.warn("[Supabase Menu] Failed to fetch restaurants, fallback active:", error.message);
      return fallbackRestaurants;
    }

    if (data && data.length > 0) {
      const restaurants = await Promise.all(
        data.map(async (r) => {
          const { data: menuData } = await getMenuItems(r.id);
          const items = menuData ? menuData.map(mapRowToMenuItem) : [];
          const fallback = fallbackRestaurants.find((f) => f.slug === r.slug || f.id === r.id);
          return mapRowToRestaurant(r, items.length > 0 ? items : fallback?.items || []);
        })
      );

      restaurants.sort((a, b) => {
        const indexA = productionSlugs.indexOf(a.slug || "");
        const indexB = productionSlugs.indexOf(b.slug || "");
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });

      return restaurants;
    }

    return fallbackRestaurants;
  } catch (err) {
    console.warn("[Supabase Menu] Exception on fetching restaurants, fallback active:", err);
    return fallbackRestaurants;
  }
}

/**
 * Fetches menu items for a specific restaurant ID (or slug) from Supabase.
 */
export async function fetchMenuItemsFromSupabase(
  restaurantIdOrSlug: string
): Promise<MenuItem[] | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantIdOrSlug);
    let targetRestaurantId = restaurantIdOrSlug;

    if (!isUuid) {
      const { data: restData } = await supabase
        .from("restaurants")
        .select("id")
        .or(`slug.eq.${restaurantIdOrSlug},id.eq.${restaurantIdOrSlug}`)
        .maybeSingle();

      if (restData?.id) {
        targetRestaurantId = restData.id;
      } else {
        const fallback = fallbackRestaurants.find((r) => r.slug === restaurantIdOrSlug || r.id === restaurantIdOrSlug);
        if (fallback) {
          targetRestaurantId = fallback.id;
        }
      }
    }

    const { data, error } = await getMenuItems(targetRestaurantId);
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
