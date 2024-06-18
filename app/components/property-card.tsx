import type { Property } from "@prisma/client";
import { Link } from "@remix-run/react";
import type React from "react";

interface PropertCardProps {
  property: Property;
  showReserveButton?: boolean;
  showEditButton?: boolean;
  editButton?: React.ReactNode;
}

export default function PropertyCard({
  property,
  showReserveButton,
  showEditButton,
  editButton,
}: PropertCardProps) {
  return (
    <div className="col-span-1 cursor-pointer group w-full">
      <div className="flex flex-col gap-1">
        <div className="overflow-hidden rounded-xl h-[200px] w-full">
          <img
            className="w-full h-auto object-cover group-hover:scale-110 transition"
            src={property.imageSrc}
            alt="Property"
          />
        </div>
        <div className="font-semibold text-lg">
          {property.name}
          {showEditButton && editButton}
        </div>
        <div className="">
          {property.location}, ${property.price}
        </div>
        {showReserveButton && (
          <div>
            <Link to={`/reserve-property/${property.id}`}>
              <button className="border-2 bg-gray-300 p-2 rounded-xl hover:bg-gray-100">
                Reserve
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
