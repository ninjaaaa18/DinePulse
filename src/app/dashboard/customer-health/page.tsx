import CustomerHealthDashboard from "@/components/dashboard/customer-health/CustomerHealthDashboard";

export const metadata = {
  title: "Customer Meal Health — DinePulse",
  description: "AI-powered meal nutritional analysis and health scoring",
};

export default function CustomerHealthPage() {
  return <CustomerHealthDashboard />;
}
