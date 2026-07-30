import RestaurantOrdersDashboard from "@/components/dashboard/orders/RestaurantOrdersDashboard";

export const metadata = {
  title: "Orders — DinePulse",
  description: "Manage your restaurant orders",
};

export default function OrdersPage() {
  return <RestaurantOrdersDashboard />;
}
