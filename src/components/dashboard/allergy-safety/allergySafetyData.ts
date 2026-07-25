export type IngredientStatus = "Safe" | "Warning" | "Avoid";

export const profileOptions = {
  conditions: [
    { id: "Diabetes", label: "Diabetes", detail: "Monitor sugar intake" },
    { id: "High Blood Pressure", label: "High Blood Pressure", detail: "Reduce sodium" },
    { id: "Kidney Disease", label: "Kidney Disease", detail: "Lower potassium and sodium" },
  ],
  diets: [
    { id: "Vegetarian", label: "Vegetarian", detail: "No meat" },
    { id: "Vegan", label: "Vegan", detail: "No animal products" },
    { id: "Gluten Free", label: "Gluten Free", detail: "Avoid wheat-based items" },
  ],
  allergies: [
    { id: "Peanut", label: "Peanut", detail: "Common severe allergen" },
    { id: "Milk", label: "Milk", detail: "Watch dairy ingredients" },
    { id: "Egg", label: "Egg", detail: "Often in sauces" },
    { id: "Seafood", label: "Seafood", detail: "Avoid shellfish and fish" },
    { id: "Soy", label: "Soy", detail: "Found in dressings" },
    { id: "Tree Nuts", label: "Tree Nuts", detail: "Include almond and cashew" },
  ],
};

export const mealItems = [
  "Chicken Burger",
  "French Fries",
  "Coke",
];

export const ingredientCards: Array<{
  name: string;
  note: string;
  status: IngredientStatus;
}> = [
  { name: "Chicken Patty", note: "Lean protein with moderate sodium", status: "Safe" },
  { name: "Bun", note: "Contains gluten; avoid for gluten-free profile", status: "Warning" },
  { name: "Cheese Slice", note: "Dairy-based and may trigger milk allergy", status: "Avoid" },
  { name: "French Fries", note: "High sodium and fried fat", status: "Warning" },
  { name: "Coke", note: "High sugar and empty calories", status: "Avoid" },
];

export const alternativeCards = [
  {
    title: "Replace Coke",
    from: "Coke",
    to: "Fresh Lime Soda",
    scoreBefore: 78,
    scoreAfter: 90,
    detail: "Lower sugar while keeping the meal refreshing",
  },
  {
    title: "Replace Fries",
    from: "French Fries",
    to: "Garden Salad",
    scoreBefore: 90,
    scoreAfter: 96,
    detail: "Adds fiber and reduces sodium load",
  },
];

export const adviceCards: Array<{
  title: string;
  body: string;
  tone: "danger" | "info" | "success";
}> = [
  {
    title: "Allergy caution",
    body: "This meal is not suitable because of your peanut allergy.",
    tone: "danger",
  },
  {
    title: "Cooking choice",
    body: "Choose grilled food instead of fried food for a gentler option.",
    tone: "info",
  },
  {
    title: "Sugar reduction",
    body: "Replacing soft drinks reduces daily sugar intake significantly.",
    tone: "success",
  },
  {
    title: "Protein balance",
    body: "Excellent protein intake from the grilled protein component.",
    tone: "success",
  },
];

export const safetyTimeline = [
  "Meal Selected",
  "Profile Checked",
  "Ingredients Analyzed",
  "Nutrition Compared",
  "Recommendation Generated",
];
