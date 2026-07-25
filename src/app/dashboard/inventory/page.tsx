import SectionPlaceholder from "@/components/dashboard/SectionPlaceholder";

export const metadata = { title: "Inventory — DinePulse" };

export default function InventoryPage() {
  return (
    <SectionPlaceholder
      title="Inventory"
      description="Track stock levels, expiry dates, and reorder recommendations."
      icon="📦"
    />
  );
}
