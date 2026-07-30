export const HEALTHY_TIPS: string[] = [
  "Meals rich in protein keep you fuller for longer.",
  "Drink a glass of water before every meal to aid digestion.",
  "Including healthy fats like avocado can improve nutrient absorption.",
  "Colorful plates with varied vegetables provide a wider range of vitamins.",
  "Eating your largest meal earlier in the day supports better metabolism.",
  "Mindful eating — chewing slowly — helps you recognize satiety cues.",
  "Pairing carbs with protein or fiber helps stabilize blood sugar.",
  "Aim for at least 25g of fiber daily for optimal digestive health.",
  "Meal prepping on weekends makes healthy weekday choices effortless.",
  "Limit added sugars to under 10% of your daily calorie intake.",
];

export function getDailyTip(): string {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % HEALTHY_TIPS.length;
  return HEALTHY_TIPS[index];
}
