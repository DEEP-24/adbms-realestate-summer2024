import {
  Button,
  Group,
  PasswordInput,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import type { ActionFunction } from "@remix-run/node";
import { Link, useFetcher, useSearchParams } from "@remix-run/react";
import appConfig from "app.config";
import { createUserSession } from "~/lib/session.server";
import { verifyLogin } from "~/lib/user.server";
import { LoginSchema } from "~/lib/zod.schema";
import { UserRole } from "~/roles";
import { badRequest, safeRedirect } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

interface ActionData {
  fieldErrors?: inferErrors<typeof LoginSchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fieldErrors, fields } = await validateAction(request, LoginSchema);

  if (fieldErrors) {
    return badRequest<ActionData>({ fieldErrors });
  }

  const { email, password, role, redirectTo, remember } = fields;

  const user = await verifyLogin(email, password, role);
  if (!user) {
    return badRequest<ActionData>({
      fieldErrors: {
        password: "Invalid username or password",
      },
    });
  }

  return createUserSession({
    request,
    userId: user.id,
    role: user.role,
    // biome-ignore lint/complexity/noUselessTernary: <explanation>
    remember: remember === "on" ? true : false,
    redirectTo: safeRedirect(redirectTo),
  });
};

export default function Login() {
  const [searchParams] = useSearchParams();

  const fetcher = useFetcher<ActionData>();
  const actionData = fetcher.data;

  const redirectTo = searchParams.get("redirectTo") || "/";
  const isSubmitting = fetcher.state !== "idle";

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 w-full">
      <div>
        <h1 className="mt-6 text-3xl font-extrabold text-gray-900 text-center">
          Sign in
        </h1>
      </div>
      <div className="flex items-center justify-center gap-4 w-[40%]">
        <div className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto" />
          <h3>{appConfig.name}</h3>
        </div>
        <div className="w-[60%]">
          <fetcher.Form method="post" replace={true} className="mt-8">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
              <Select
                data={Object.values(UserRole).map((role) => ({
                  value: role,
                  label: role,
                }))}
                name="role"
                label="Role"
                error={actionData?.fieldErrors?.role}
                required={true}
              />
              <TextInput
                name="email"
                type="email"
                autoComplete="email"
                label="Email address"
                error={actionData?.fieldErrors?.email}
                required={true}
              />
              <PasswordInput
                name="password"
                label="Password"
                error={actionData?.fieldErrors?.password}
                autoComplete="current-password"
                required={true}
              />
              <div className="flex justify-between items-center mt-2">
                <Group position="apart">
                  <Switch
                    id="remember-me"
                    name="rememberMe"
                    label="Remember me"
                  />
                </Group>
                <Link
                  to="/sign-up"
                  className="text-sm text-gray-600 underline hover:text-black"
                >
                  Sign Up
                </Link>
              </div>
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth={true}
                loaderPosition="right"
                mt="1rem"
              >
                Sign in
              </Button>
            </fieldset>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
