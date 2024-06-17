import { PrismaClient } from "@prisma/client";
import { createPasswordHash } from "~/utils/misc.server";

const db = new PrismaClient();

async function main() {
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

  const user = await db.user.create({
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
      zipcode: "12345"
    },
  });

  // Seed Property Listings
  const propertyListing1 = await db.property.create({
    data: {
      title: "Luxury Villa",
      description: "A beautiful luxury villa.",
      imageSrc:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdmlsbGF8ZW58MHx8MHx8fDA%3D",
      createdAt: new Date(),
      category: "Villa",
      roomCount: 5,
      bathroomCount: 3,
      guestCount: 10,
      location: "Malibu",
      price: 5000,
      propertyManagerId: propertyManager.id,
    },
  });

  const propertyListing2 = await db.property.create({
    data: {
      title: "Cozy Apartment",
      description: "A cozy apartment in the city center.",
      imageSrc:
        "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q296eSUyMGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D",
      createdAt: new Date(),
      category: "Apartment",
      roomCount: 2,
      bathroomCount: 1,
      guestCount: 4,
      location: "New York",
      price: 1500,
      propertyManagerId: propertyManager.id,
    },
  });

  const propertListing3 = await db.property.create({
    data: {
      title: "Beach House",
      description: "A beautiful beach house.",
      imageSrc:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D",
      createdAt: new Date(),
      category: "House",
      roomCount: 3,
      bathroomCount: 2,
      guestCount: 6,
      location: "Miami",
      price: 3000,
      propertyManagerId: propertyManager.id,
    },
  });

  await db.property.create({
    data: {
      title: "Mountain Cabin",
      description: "A cozy cabin in the mountains.",
      imageSrc:
        "https://images.unsplash.com/photo-1609349093648-51d2ceb5a72a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBjYWJpbnxlbnwwfHwwfHx8MA%3D%3D",
      createdAt: new Date(),
      category: "Cabin",
      roomCount: 2,
      bathroomCount: 1,
      guestCount: 4,
      location: "Aspen",
      price: 2000,
      propertyManagerId: propertyManager.id,
    },
  });

  // Seed Reservations
  await db.reservation.create({
    data: {
      userId: user.id,
      propertyId: propertyListing1.id,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-06-10"),
      totalPrice: 50000,
      createdAt: new Date(),
    },
  });

  await db.reservation.create({
    data: {
      userId: user.id,
      propertyId: propertyListing2.id,
      startDate: new Date("2024-07-01"),
      endDate: new Date("2024-07-05"),
      totalPrice: 7500,
      createdAt: new Date(),
    },
  });

  await db.reservation.create({
    data: {
      userId: user.id,
      propertyId: propertListing3.id,
      startDate: new Date("2024-08-01"),
      endDate: new Date("2024-08-15"),
      totalPrice: 45000,
      createdAt: new Date(),
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
