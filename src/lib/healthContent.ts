export type HealthCardType =
  | "myth-vs-fact"
  | "food-spotlight"
  | "did-you-know"
  | "healthy-swap"
  | "nutrition-fact"
  | "daily-habit"
  | "smart-tip";

export type HealthCard = {
  type: HealthCardType;
  icon: string;
  badge: string;
  myth?: string;
  fact: string;
};

const CARDS: HealthCard[] = [
  {
    type: "myth-vs-fact",
    icon: "🔬",
    badge: "Myth vs Fact",
    myth: "Eating healthy is expensive.",
    fact: "Whole grains, legumes, and seasonal vegetables are often cheaper than processed foods.",
  },
  {
    type: "myth-vs-fact",
    icon: "🔬",
    badge: "Myth vs Fact",
    myth: "Healthy food is boring.",
    fact: "Healthy food can be delicious, colourful, and incredibly satisfying with the right spices and preparation.",
  },
  {
    type: "myth-vs-fact",
    icon: "🔬",
    badge: "Myth vs Fact",
    myth: "Carbs always make you gain weight.",
    fact: "Complex carbs like whole grains, oats, and quinoa provide sustained energy and essential fibre.",
  },
  {
    type: "myth-vs-fact",
    icon: "🔬",
    badge: "Myth vs Fact",
    myth: "Skipping meals helps with weight loss.",
    fact: "Regular balanced meals keep your metabolism active and prevent overeating later in the day.",
  },
  {
    type: "myth-vs-fact",
    icon: "🔬",
    badge: "Myth vs Fact",
    myth: "Fruit contains too much sugar.",
    fact: "Whole fruit provides fibre, vitamins, and antioxidants that far outweigh its natural sugar content.",
  },
  {
    type: "myth-vs-fact",
    icon: "🔬",
    badge: "Myth vs Fact",
    myth: "Eating late at night always causes weight gain.",
    fact: "Total daily calorie intake matters more than timing — a light, balanced snack is perfectly fine.",
  },
  {
    type: "food-spotlight",
    icon: "🥑",
    badge: "Food Spotlight",
    fact: "Avocados are packed with healthy monounsaturated fats that support heart health and help absorb fat-soluble vitamins.",
  },
  {
    type: "food-spotlight",
    icon: "🫐",
    badge: "Food Spotlight",
    fact: "Blueberries are rich in antioxidants that may help reduce inflammation and support brain function as you age.",
  },
  {
    type: "did-you-know",
    icon: "💡",
    badge: "Did You Know?",
    fact: "Drinking a glass of water before meals may help reduce overeating by promoting a feeling of fullness.",
  },
  {
    type: "did-you-know",
    icon: "💡",
    badge: "Did You Know?",
    fact: "Chewing food slowly can improve digestion and help you recognise your body's satiety signals earlier.",
  },
  {
    type: "healthy-swap",
    icon: "🥦",
    badge: "Healthy Swap",
    fact: "Swap fried chicken for grilled chicken to reduce unhealthy fats while keeping the protein and flavour.",
  },
  {
    type: "healthy-swap",
    icon: "🥦",
    badge: "Healthy Swap",
    fact: "Replace white rice with quinoa or cauliflower rice for more fibre, protein, and fewer refined carbs.",
  },
  {
    type: "nutrition-fact",
    icon: "📊",
    badge: "Nutrition Fact",
    fact: "A single serving of leafy greens provides over 100% of your daily vitamin K needs, essential for bone health.",
  },
  {
    type: "nutrition-fact",
    icon: "📊",
    badge: "Nutrition Fact",
    fact: "Fibre-rich foods like oats and legumes help maintain stable blood sugar levels and keep you fuller longer.",
  },
  {
    type: "daily-habit",
    icon: "🌱",
    badge: "Daily Habit",
    fact: "Start your day with a high-protein breakfast to stabilise energy levels and reduce mid-morning cravings.",
  },
  {
    type: "daily-habit",
    icon: "🌱",
    badge: "Daily Habit",
    fact: "Include at least three different coloured vegetables in your lunch to ensure a wide range of nutrients.",
  },
  {
    type: "smart-tip",
    icon: "🧠",
    badge: "Smart Eating Tip",
    fact: "Use smaller plates to naturally control portion sizes — it's a visual trick that helps reduce overeating.",
  },
  {
    type: "smart-tip",
    icon: "🧠",
    badge: "Smart Eating Tip",
    fact: "Prep your meals on Sunday to make healthy weekday eating effortless and reduce the temptation to order out.",
  },
];

export function getRandomCard(): HealthCard {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % CARDS.length;
  return CARDS[index];
}

export const DAILY_TIPS = [
  "💧 Drink more water today — aim for 8 glasses.",
  "🥗 Add one serving of vegetables to your lunch.",
  "🍎 Eat one whole fruit as a mid-day snack.",
  "🚶 Walk 10 minutes after lunch to aid digestion.",
  "🥜 Replace chips with a handful of almonds.",
  "🌿 Season with herbs instead of salt.",
  "🍚 Choose whole grains over refined options.",
  "☕ Cut back on sugary coffee drinks.",
  "🍳 Eat protein at every meal.",
  "🧘 Take 5 deep breaths before eating to eat mindfully.",
  "🍵 Drink green tea instead of soda.",
  "🥑 Add healthy fats like avocado to your salad.",
  "🥣 Start meals with a soup or salad to reduce overall calorie intake.",
  "🍌 Eat potassium-rich foods like bananas to help regulate blood pressure.",
  "🐟 Include fatty fish like salmon twice a week for omega-3s.",
  "🧀 Choose Greek yogurt over regular for double the protein.",
  "🌰 Sprinkle seeds on your meals for extra fibre and minerals.",
  "🥕 Eat the rainbow — different coloured vegetables provide different nutrients.",
];

export function getDailyTip(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return DAILY_TIPS[seed % DAILY_TIPS.length];
}

export const INSIGHT_CHIPS = [
  { icon: "🥗", label: "Balanced Diet", desc: "Small healthy meals improve energy." },
  { icon: "💧", label: "Stay Hydrated", desc: "Drink 2–3L of water daily." },
  { icon: "🚶", label: "Stay Active", desc: "A 20-minute walk after meals supports digestion." },
  { icon: "😴", label: "Sleep Well", desc: "7–8 hours of sleep helps regulate hunger hormones." },
  { icon: "🧘", label: "Mindful Eating", desc: "Eating without distractions improves portion control." },
  { icon: "🌿", label: "Whole Foods", desc: "Minimally processed foods retain more nutrients." },
  { icon: "🥩", label: "Lean Protein", desc: "Protein at every meal supports muscle and satiety." },
  { icon: "🍞", label: "Smart Carbs", desc: "Choose whole grains over refined for steady energy." },
];

export function getDailyInsightChips(): typeof INSIGHT_CHIPS {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...INSIGHT_CHIPS];
  const start = seed % shuffled.length;
  return [shuffled[start % shuffled.length], shuffled[(start + 1) % shuffled.length], shuffled[(start + 2) % shuffled.length]];
}
