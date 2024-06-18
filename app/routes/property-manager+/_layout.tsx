import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Outlet, useActionData, useLoaderData } from "@remix-run/react";
import Navbar from "~/components/Navbar";
import { isAdmin, isCustomer, requireUserId } from "~/lib/session.server";
import { getPropertyManager } from "~/lib/user.server";
import type { NavbarLink } from "~/routes/admin+/_layout";
import { useOptionalPropertyManager } from "~/utils/hooks";
import { z } from "zod";
import { type inferErrors, validateAction } from "~/utils/validation";
import { badRequest, createPasswordHash } from "~/utils/misc.server";
import { db } from "~/lib/prisma.server";
import { useIsPending } from "~/utils/use-is-pending";
import { Button, Modal, PasswordInput, ScrollArea } from "@mantine/core";

export type AppLoaderData = SerializeFrom<typeof loader>;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  const propertyManager = await getPropertyManager(request);

  if (await isAdmin(request)) {
    return redirect("/admin");
  }
  if (await isCustomer(request)) {
    return redirect("/");
  }

  return json({
    hasResetPassword: propertyManager!.hasResetPassword,
  });
};

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword", "password"],
      });
    }
  });

interface ActionData {
  fieldErrors?: inferErrors<typeof ResetPasswordSchema>;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const { fieldErrors, fields } = await validateAction(
    request,
    ResetPasswordSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors });
  }

  const { password } = fields;

  await db.propertyManager.update({
    where: {
      id: userId,
    },
    data: {
      hasResetPassword: true,
      password: await createPasswordHash(password),
    },
  });

  return json({
    success: true,
  });
};
const NavLinks: NavbarLink[] = [
  {
    id: 1,
    href: "/property-manager/my-properties",
    label: "My Properties",
  },
  {
    id: 2,
    href: "/property-manager/reservations",
    label: "Reservations",
  },
];

export default function AppLayout() {
  const { hasResetPassword } = useLoaderData<typeof loader>();
  const user = useOptionalPropertyManager();

  const actionData = useActionData<ActionData>();
  const isPending = useIsPending();

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        <Navbar
          userName={`${user!.firstName} ${user!.lastName}`}
          navLinks={NavLinks}
          userEmail={user!.email}
        />
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
      <Modal
        closeOnClickOutside={false}
        closeOnEscape={false}
        // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
        onClose={() => {}}
        opened={!hasResetPassword}
        padding="lg"
        scrollAreaComponent={ScrollArea.Autosize}
        size="md"
        title="Reset Password"
        withCloseButton={false}
      >
        <Form className="flex flex-col gap-4" method="post">
          <PasswordInput
            autoFocus={true}
            error={actionData?.fieldErrors?.password}
            label="New Password"
            name="password"
            placeholder="Enter new password"
            required={true}
            type="password"
          />

          <PasswordInput
            error={actionData?.fieldErrors?.confirmPassword}
            label="Confirm new password"
            name="confirmPassword"
            placeholder="Confirm new password"
            required={true}
            type="password"
          />

          <div className="mt-4 flex items-center justify-end gap-4">
            <Button loading={isPending} type="submit">
              Reset Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
