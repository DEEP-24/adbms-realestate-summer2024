import { PlusIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Modal,
  PasswordInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import type { PropertyManager } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ObjectId } from "bson";
import * as React from "react";
import { z } from "zod";
import { getAllCommunities } from "~/lib/community.server";
import { db } from "~/lib/prisma.server";
import { getAllPropertyManagers } from "~/lib/propert-managers.server";
import { cn } from "~/lib/utils";
import { UserRole } from "~/roles";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

enum MODE {
  edit = 0,
  add = 1,
}

const ManagePropertyManagerSchema = z
  .object({
    propertyManagerId: z.string().optional(),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
    phoneNo: z.string().min(10, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    role: z.nativeEnum(UserRole),
    dob: z.string().trim().min(10, "Date of birth is required"),
    city: z.string().min(1, "City is required"),
    zipcode: z.string().min(5, "Zipcode is required"),
    communityId: z.string().min(1, "Community is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["password", "confirmPassword"],
  });

export const loader = async () => {
  const propertyManagers = await getAllPropertyManagers();
  const communities = await getAllCommunities();

  return json({
    propertyManagers,
    communities,
  });
};

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ManagePropertyManagerSchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    ManagePropertyManagerSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  //add a check here to see if the community has a property manager then the user cannot select that particular community
  const communityHasManager = await db.propertyManager.findFirst({
    where: {
      community: {
        id: fields.communityId,
      },
    },
  });

  if (communityHasManager) {
    return badRequest<ActionData>({
      success: false,
      fieldErrors: {
        communityId: "Community already has a property manager",
      },
    });
  }

  const {
    propertyManagerId,
    firstName,
    lastName,
    email,
    password,
    phoneNo,
    address,
    dob,
    city,
    zipcode,
    communityId,
    role,
  } = fields;
  const id = new ObjectId();

  await db.propertyManager.upsert({
    where: {
      id: propertyManagerId || id.toString(),
    },
    update: {
      firstName,
      lastName,
      email,
      password,
      phoneNo,
      address,
      dob: new Date(dob),
      city,
      zipcode,
      community: {
        connect: {
          id: communityId,
        },
      },
    },
    create: {
      id: propertyManagerId || id.toString(),
      firstName,
      lastName,
      email,
      password,
      phoneNo,
      address,
      dob: new Date(dob),
      city,
      zipcode,
      role: role as PropertyManager["role"],
      community: {
        connect: {
          id: communityId,
        },
      },
    },
  });

  return json({
    success: true,
  });
};

export default function ManageProducts() {
  const fetcher = useFetcher<ActionData>();
  const { propertyManagers, communities } = useLoaderData<typeof loader>();

  const [selectedPropertyManagerId, setSelectedPropertyManagerId] =
    React.useState<PropertyManager["id"] | null>(null);

  const [selectedPropertyManager, setSelectedPropertyManager] = React.useState<
    (typeof propertyManagers)[number] | null
  >(null);

  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const [communityId, setCommunityId] = React.useState<string>("");
  // biome-ignore lint/correctness/noUnusedVariables: <explanation>
  const [dob, setDob] = React.useState<string>("");
  const [mode, setMode] = React.useState<MODE>(MODE.edit);
  const [isModalOpen, handleModal] = useDisclosure(false);

  const isSubmitting = fetcher.state !== "idle";

  const availabeCommunities = communities.filter(
    (community) =>
      !propertyManagers.find(
        (propertyManager) => propertyManager.community!.id === community.id,
      ),
  );

  const availableCommunitiesWithDefault = communities.filter(
    (community) =>
      !propertyManagers.find(
        (propertyManager) => propertyManager.community!.id === community.id,
      ) || community.id === selectedPropertyManager?.community?.id,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (fetcher.state !== "idle" && fetcher.data === undefined) {
      return;
    }

    if (fetcher.data?.success) {
      setSelectedPropertyManagerId(null);
      handleModal.close();
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [fetcher.data?.success, fetcher.state, fetcher.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (!selectedPropertyManagerId) {
      setSelectedPropertyManager(null);
      return;
    }

    const _propertyManager = propertyManagers.find(
      (propertyManager) => propertyManager.id === selectedPropertyManagerId,
    );
    if (!_propertyManager) {
      return;
    }

    setSelectedPropertyManager(_propertyManager);
    handleModal.open();
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [propertyManagers, selectedPropertyManagerId]);

  React.useEffect(() => {
    if (mode === MODE.add) {
      setSelectedPropertyManagerId(null);
      setSelectedPropertyManager(null);
    }
  }, [mode]);

  return (
    <>
      <div className="p-5 w-full h-full overflow-x-hidden">
        <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Manage Property Managers
            </h1>
          </div>
          <div>
            <Button
              loading={isSubmitting}
              onClick={() => {
                setMode(MODE.add);
                handleModal.open();
              }}
              color="gray"
              className="hover:bg-gray-200"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="ml-2">Add Property Manager</span>
            </Button>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 overflow-hidden">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                    >
                      Name
                    </th>

                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {propertyManagers.map((propertyManager) => (
                    <tr key={propertyManager.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
                        {propertyManager.firstName} {propertyManager.lastName}
                      </td>

                      <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6 md:pr-0">
                        <div className="flex items-center gap-6">
                          <Button
                            loading={isSubmitting}
                            variant="subtle"
                            onClick={() => {
                              setSelectedPropertyManagerId(propertyManager.id);
                              setMode(MODE.edit);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          setSelectedPropertyManagerId(null);
          handleModal.close();
        }}
        title={cn({
          "Edit Property Manager": mode === MODE.edit,
          "Add Property Manager": mode === MODE.add,
        })}
        centered={true}
        overlayProps={{ blur: "0.9", opacity: 0.9 }}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <fetcher.Form method="post">
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <input
              type="hidden"
              name="propertyManagerId"
              value={selectedPropertyManager?.id}
            />

            <input
              type="hidden"
              name="role"
              value={UserRole.PROPERTY_MANAGER}
            />

            <div className="flex items-center justify-between inset-0 gap-2 w-full">
              <DatePickerInput
                name="dob"
                label="Date of Birth"
                required={true}
                maxDate={new Date()}
                error={fetcher.data?.fieldErrors?.dob}
                defaultValue={
                  selectedPropertyManager
                    ? new Date(selectedPropertyManager.dob as string)
                    : undefined
                }
                className="w-full"
              />
              {mode === MODE.add && (
                <Select
                  data={Object.values(availabeCommunities).map((community) => ({
                    label: community.name,
                    value: community.id,
                  }))}
                  name="communityId"
                  label="Community"
                  className="w-full"
                  error={fetcher.data?.fieldErrors?.communityId}
                  defaultValue={selectedPropertyManager?.community?.id}
                />
              )}

              {mode === MODE.edit && (
                <Select
                  data={Object.values(availableCommunitiesWithDefault).map(
                    (community) => ({
                      label: community.name,
                      value: community.id,
                    }),
                  )}
                  name="communityId"
                  label="Community"
                  className="w-full"
                  error={fetcher.data?.fieldErrors?.communityId}
                  defaultValue={selectedPropertyManager?.community?.id}
                />
              )}
            </div>

            <div className="flex justify-between inset-0 gap-2 w-full">
              <TextInput
                name="firstName"
                autoComplete="given-name"
                label="First Name"
                error={fetcher.data?.fieldErrors?.firstName}
                required={true}
                className="w-full"
                defaultValue={selectedPropertyManager?.firstName}
              />

              <TextInput
                name="lastName"
                autoComplete="given-name"
                label="Last Name"
                error={fetcher.data?.fieldErrors?.lastName}
                required={true}
                className="w-full"
                defaultValue={selectedPropertyManager?.lastName}
              />
            </div>

            <TextInput
              name="email"
              type="email"
              autoComplete="email"
              label="Email address"
              error={fetcher.data?.fieldErrors?.email}
              defaultValue={selectedPropertyManager?.email}
              required={true}
            />

            <div className="flex justify-between inset-0 w-full gap-2">
              <PasswordInput
                name="password"
                label="Password"
                error={fetcher.data?.fieldErrors?.password}
                autoComplete="current-password"
                required={true}
                className="w-full"
              />
              <PasswordInput
                name="confirmPassword"
                label="Confirm Password"
                error={fetcher.data?.fieldErrors?.confirmPassword}
                autoComplete="current-password"
                required={true}
                className="w-full"
              />
            </div>

            <TextInput
              name="phoneNo"
              type="tel"
              label="Phone Number"
              error={fetcher.data?.fieldErrors?.phoneNo}
              required={true}
              defaultValue={selectedPropertyManager?.phoneNo}
            />

            <Textarea
              name="address"
              label="Address"
              autoComplete="street-address"
              defaultValue={selectedPropertyManager?.address}
            />

            <div className="flex justify-between inset-0 gap-2 w-full">
              <TextInput
                name="city"
                label="City"
                error={fetcher.data?.fieldErrors?.city}
                required={true}
                className="w-full"
                defaultValue={selectedPropertyManager?.city}
              />

              <TextInput
                name="zipcode"
                label="Zip Code"
                error={fetcher.data?.fieldErrors?.zipcode}
                required={true}
                className="w-full"
                defaultValue={selectedPropertyManager?.zipcode}
              />
            </div>

            <div className="mt-1 flex items-center justify-end gap-4">
              <Button
                variant="subtle"
                type="button"
                disabled={isSubmitting}
                onClick={() => handleModal.close()}
                color="red"
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {mode === MODE.edit ? "Save changes" : "Add Property Manager"}
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  );
}
