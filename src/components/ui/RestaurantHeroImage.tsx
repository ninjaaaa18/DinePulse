import { getRestaurantImage } from "@/lib/restaurantImages";

type Props = {
  cuisine: string;
  name: string;
  className?: string;
  size?: "card" | "banner";
};

export default function RestaurantHeroImage({ cuisine, name, className = "", size = "card" }: Props) {
  const src = getRestaurantImage(cuisine);

  if (size === "banner") {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={src}
          alt={`${name} — ${cuisine}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-t-2xl ${className}`}>
      <img
        src={src}
        alt={`${name} — ${cuisine}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    </div>
  );
}
