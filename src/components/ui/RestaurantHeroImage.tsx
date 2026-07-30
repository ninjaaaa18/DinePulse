import { memo } from "react";
import Image from "next/image";
import { getRestaurantImage } from "@/lib/restaurantImages";

type Props = {
  cuisine: string;
  name: string;
  className?: string;
  size?: "card" | "banner";
};

const RestaurantHeroImage = memo(function RestaurantHeroImage({ cuisine, name, className = "", size = "card" }: Props) {
  const src = getRestaurantImage(cuisine);

  if (size === "banner") {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={`${name} — ${cuisine}`}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-t-2xl ${className}`}>
      <Image
        src={src}
        alt={`${name} — ${cuisine}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    </div>
  );
});

export default RestaurantHeroImage;