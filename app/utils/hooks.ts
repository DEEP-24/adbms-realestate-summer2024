import { useMatches } from "@remix-run/react";
import * as React from "react";
import type { RootLoaderData } from "~/root";
// /**
//  * This base hook is used in other hooks to quickly search for specific data
//  * across all loader data using useMatches.
//  * @param {string} routeId The route id
//  * @returns {JSON|undefined} The router data or undefined if not found
//  */
export function useMatchesData(
  routeId: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();

  const route = React.useMemo(
    () => matchingRoutes.find((route) => route.id === routeId),
    [matchingRoutes, routeId],
  );
  return route?.data as Record<string, unknown>;
}

export function useOptionalAdmin() {
  const { admin } = useMatchesData("root") as RootLoaderData;
  return admin;
}

export function useAdmin() {
  const maybeAdmin = useOptionalAdmin();
  if (!maybeAdmin) {
    throw new Error(
      "No admin found in root loader, but admin is required by useAdmin. If admin is optional, try useOptionalAdmin instead.",
    );
  }

  return maybeAdmin;
}

export function useOptionCustomer() {
  const { user } = useMatchesData("root") as RootLoaderData;
  return user;
}

export function useCustomer() {
  const maybeCustomer = useOptionCustomer();
  if (!maybeCustomer) {
    throw new Error(
      "No admin found in root loader, but admin is required by useAdmin. If admin is optional, try useOptionalAdmin instead.",
    );
  }

  return maybeCustomer;
}

export function useOptionalPropertyManager() {
  const { propertyManager } = useMatchesData("root") as RootLoaderData;
  return propertyManager;
}

export function usePropertyManager() {
  const maybePropertyManager = useOptionalPropertyManager();
  if (!maybePropertyManager) {
    throw new Error(
      "No admin found in root loader, but admin is required by useAdmin. If admin is optional, try useOptionalAdmin instead.",
    );
  }

  return maybePropertyManager;
}

// export function useAppData() {
//   return useMatchesData("routes/__app") as AppLoaderData;
// }

type ReturnType<T> = [T, React.Dispatch<React.SetStateAction<T>>];
export function useLocalStorageState<T>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: T;
}): ReturnType<T> {
  const [value, setValue] = React.useState<T>(defaultValue);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    const localStorageValue = window.localStorage.getItem(key);

    if (!localStorageValue) {
      setValue(defaultValue);
      return;
    }

    setValue(JSON.parse(localStorageValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
