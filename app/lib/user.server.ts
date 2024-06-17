import type { Admin, PropertyManager, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { db } from "~/lib/prisma.server";
import { getUserId, logout } from "~/lib/session.server";
import { UserRole } from "~/roles";
import { createPasswordHash } from "~/utils/misc.server";

export async function getUserById(id: User["id"]) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
    },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return db.user.findUnique({
    where: { email },
    select: {
      name: true,
      email: true,
    },
  });
}

export async function createUser({
  email,
  password,
  name,
  role,
  phoneNo,
  address,
}: {
  email: User["email"];
  password: string;
  name: User["name"];
  role: User["role"];
  phoneNo: User["phoneNo"];
  address: User["address"];
}) {
  if (role === UserRole.USER) {
    return db.user.create({
      data: {
        name,
        email,
        password: await createPasswordHash(password),
        role,
        phoneNo,
        address,
      },
    });
  }
  if (role === UserRole.PROPERTY_MANAGER) {
    return db.propertyManager.create({
      data: {
        name,
        email,
        password: await createPasswordHash(password),
        role,
        phoneNo,
        address,
      },
    });
  }

  return null;
}

export async function verifyLogin(
  email: User["email"],
  password: string,
  role: User["role"],
) {
  if (role === UserRole.ADMIN) {
    const adminWithPassword = await db.admin.findUnique({
      where: { email },
    });

    if (!adminWithPassword || !adminWithPassword.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, adminWithPassword.password);

    if (!isValid) {
      return null;
    }

    const { password: _password, ...adminWithoutPassword } = adminWithPassword;

    return adminWithoutPassword;
  }
  if (role === UserRole.USER) {
    const userWithPassword = await db.user.findUnique({
      where: { email },
    });

    if (!userWithPassword || !userWithPassword.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isValid) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = userWithPassword;

    return userWithoutPassword;
  }
  if (role === UserRole.PROPERTY_MANAGER) {
    const propertyManagerWithPassword = await db.propertyManager.findUnique({
      where: { email },
    });

    if (!propertyManagerWithPassword || !propertyManagerWithPassword.password) {
      return null;
    }

    const isValid = await bcrypt.compare(
      password,
      propertyManagerWithPassword.password,
    );

    if (!isValid) {
      return null;
    }

    const { password: _password, ...propertyManagerwithoutPassword } =
      propertyManagerWithPassword;

    return propertyManagerwithoutPassword;
  }
}

export async function getAdminById(id: Admin["id"]) {
  return db.admin.findUnique({
    where: { id },
  });
}

export async function getCustomerById(id: User["id"]) {
  return db.user.findUnique({
    where: { id },
  });
}

export async function getPropertyManagerById(id: PropertyManager["id"]) {
  return db.propertyManager.findUnique({
    where: { id },
  });
}

export async function getAdmin(request: Request) {
  const userId = await getUserId(request);

  if (userId === undefined) {
    return null;
  }

  const admin = await getAdminById(userId);
  if (admin) {
    return admin;
  }

  throw await logout(request);
}

export async function getCustomer(request: Request) {
  const userId = await getUserId(request);

  if (userId === undefined) {
    return null;
  }

  const customer = await getCustomerById(userId);
  if (customer) {
    return customer;
  }

  throw await logout(request);
}

export async function getPropertyManager(request: Request) {
  const userId = await getUserId(request);

  if (userId === undefined) {
    return null;
  }

  const propertyManager = await getPropertyManagerById(userId);
  if (propertyManager) {
    return propertyManager;
  }

  throw await logout(request);
}
