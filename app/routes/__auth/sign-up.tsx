import {
  Group,
  PasswordInput,
  Select,
  Switch,
  TextInput,
  Textarea,
} from "@mantine/core";
import type { ActionFunction } from "@remix-run/node";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import appConfig from "app.config";
import { Button } from "~/components/ui/button";
import { createUserSession } from "~/lib/session.server";
import { createUser, getUserByEmail } from "~/lib/user.server";
import { RegisterUserSchema } from "~/lib/zod.schema";
import { UserRole } from "~/roles";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

interface ActionData {
  fieldErrors?: inferErrors<typeof RegisterUserSchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fieldErrors, fields } = await validateAction(
    request,
    RegisterUserSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors });
  }

  const { email, password, firstName, lastName, phoneNo, address, role, dob, city, zipcode } = fields;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return badRequest<ActionData>({
      fieldErrors: {
        email: "A user already exists with this email",
      },
    });
  }

  const user = await createUser({
    firstName,
    lastName,
    email,
    password,
    phoneNo,
    address,
    dob: new Date(dob),
    city,
    zipcode,
    role,
  });

  return createUserSession({
    request,
    userId: user!.id,
    role: user!.role,
    redirectTo: "/",
  });
};

export default function SignUp() {
  const [searchParams] = useSearchParams();

  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;

  const redirectTo = searchParams.get("redirectTo") || "/";
  const isSubmitting = fetcher.state !== "idle";

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 w-[30vw] top-1">
      <div>
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
          Sign Up
        </h1>
      </div>
      <div className="flex items-center justify-center gap-2">
        <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto" />
        <h3>{appConfig.name}</h3>
      </div>
      <div className="w-full p-5">
        <fetcher.Form method="post" replace={true} className="mt-8">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
              <div className="flex items-center justify-between inset-0 gap-2 w-full">
                <Select
                  data={Object.values(UserRole)
                    .filter((role) => role !== UserRole.ADMIN)
                    .map((role) => ({
                      value: role,
                      label: role,
                    }))}
                  name="role"
                  label="Role"
                  error={actionData?.fieldErrors?.role}
                  required={true}
                  className="w-full"
                />
               <div className="flex flex-col items-center justify-center">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-500 border-2 rounded-lg p-1"
                  required={true}
                />
               </div>
              </div>

            <div className="flex justify-between inset-0 gap-2 w-full">
              <TextInput
                name="firstName"
                autoComplete="given-name"
                label="First Name"
                error={actionData?.fieldErrors?.firstName}
                required={true}
                className="w-full"
              />

              <TextInput
                name="lastName"
                autoComplete="given-name"
                label="Last Name"
                error={actionData?.fieldErrors?.lastName}
                required={true}
                className="w-full"
              />           
            </div>

            <TextInput
              name="email"
              type="email"
              autoComplete="email"
              label="Email address"
              error={actionData?.fieldErrors?.email}
              required={true}
            />

            <div className="flex justify-between inset-0 w-full gap-2">
              <PasswordInput
                name="password"
                label="Password"
                error={actionData?.fieldErrors?.password}
                autoComplete="current-password"
                required={true}
                className="w-full"
              />
              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                error={actionData?.fieldErrors?.confirmPassword}
                autoComplete="current-password"
                required={true}
                className="w-full"
              />
            </div>

            <TextInput
              name="phoneNo"
              type="tel"
              label="Phone Number"
              error={actionData?.fieldErrors?.phoneNo}
              required={true}
            />

            <Textarea
              name="address"
              label="Address"
              autoComplete="street-address"
            />

            <div className="flex justify-between inset-0 gap-2 w-full">
              <TextInput
                name="city"
                label="City"
                error={actionData?.fieldErrors?.city}
                required={true}
                className="w-full"
              />

              <TextInput
                name="zipcode"
                label="Zip Code"
                error={actionData?.fieldErrors?.zipcode}
                required={true}
                className="w-full"
              />           
            </div>

            <div className="flex justify-between items-center mt-2">
              <Group position="apart">
                <Switch
                  id="remember-me"
                  name="rememberMe"
                  label="Remember me"
                />
              </Group>
              <Link
                to="/login"
                className="text-sm text-gray-600 underline hover:text-black"
              >
                Sign In
              </Link>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="hover:bg-blue-300 rounded-xl mt-2"
            >
              Sign Up
            </Button>
          </fieldset>
        </fetcher.Form>
      </div>
    </div>
  );
}
