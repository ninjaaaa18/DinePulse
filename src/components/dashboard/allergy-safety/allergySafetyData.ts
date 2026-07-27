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

export const defaultAdviceCards: Array<{
  title: string;
  body: string;
  tone: "danger" | "info" | "success";
}> = [
  {
    title: "Allergy caution",
    body: "Review meal allergens against customer health preferences before serving.",
    tone: "danger",
  },
  {
    title: "Cooking choice",
    body: "Opt for fresh grilled preparations when possible to minimize sodium.",
    tone: "info",
  },
  {
    title: "Sugar reduction",
    body: "Replacing sweetened beverages significantly reduces overall meal glycemic load.",
    tone: "success",
  },
];

export const safetyTimeline = [
  "Order Received",
  "Health Profile Matched",
  "Ingredients Screened",
  "Cross-Contact Analyzed",
  "Safety Review Complete",
];
