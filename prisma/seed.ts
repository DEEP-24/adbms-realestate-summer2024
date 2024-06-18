import { PrismaClient } from "@prisma/client";
import { PropertyType } from "~/property-type";
import { createPasswordHash } from "~/utils/misc.server";

const db = new PrismaClient();

async function main() {
  await db.community.deleteMany();
  await db.admin.deleteMany();
  await db.user.deleteMany();
  await db.propertyManager.deleteMany();
  await db.property.deleteMany();
  await db.reservation.deleteMany();
  await db.request.deleteMany();

  await db.admin.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@app.com",
      password: await createPasswordHash("password"),
      dob: new Date("1990-01-01"),
      phoneNo: "1234567890",
      address: "123 Admin Street",
      city: "Admin City",
      zipcode: "12345",
    },
  });

  await db.user.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "user@app.com",
      password: await createPasswordHash("password"),
      phoneNo: "1234567890",
      address: "123 User Street",
      dob: new Date("1990-01-01"),
      city: "User City",
      zipcode: "12345",
    },
  });

  const propertyManager = await db.propertyManager.create({
    data: {
      firstName: "Property",
      lastName: "Manager",
      email: "propertymanager@app.com",
      password: await createPasswordHash("password"),
      phoneNo: "1234567890",
      address: "123 Property Manager Street",
      dob: new Date("1990-01-01"),
      city: "Property Manager City",
      zipcode: "12345",
    },
  });

  const community1 = await db.community.create({
    data: {
      name: "Community 1",
      propertyManagerId: propertyManager.id,
    },
  });

  // Seed Property Listings
  await db.property.create({
    data: {
      name: "Luxury Villa",
      description: "A beautiful luxury villa.",
      imageSrc:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D",
      bathCount: 3,
      bedCount: 4,
      location: "Malibu",
      depositAmount: 1000,
      type: PropertyType.VILLA,
      price: 5000,
      amenities: ["AC", "Dishwasher", "Refrigerator", "Washer", "Dryer"],
      communityId: community1.id,
    },
  });

  await db.property.create({
    data: {
      name: "Cozy Apartment",
      description: "A cozy apartment in the city center.",
      imageSrc:
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q296eSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D",
      bathCount: 2,
      bedCount: 2,
      location: "New York",
      depositAmount: 500,
      type: PropertyType.APARTMENT,
      price: 1500,
      amenities: ["AC", "Dishwasher", "Refrigerator", "Washer", "Dryer"],
      communityId: community1.id,
    },
  });

  await db.property.create({
    data: {
      name: "Mountain Cabin",
      description: "A cozy cabin in the mountains.",
      imageSrc:
        "https://images.unsplash.com/photo-1609349093648-51d2ceb5a72a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBjYWJpbnxlbnwwfHwwfHx8MA%3D%3D",
      bathCount: 1,
      bedCount: 1,
      location: "Aspen",
      depositAmount: 200,
      type: PropertyType.HOUSE,
      price: 2000,
      amenities: ["AC", "Dishwasher", "Refrigerator", "Washer", "Dryer"],
      communityId: community1.id,
    },
  });

  console.log("Database has been seeded. 🍁");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
