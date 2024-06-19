import { PlusIcon } from "@heroicons/react/24/solid";
import { Button, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Community } from "@prisma/client";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ObjectId } from "bson";
import * as React from "react";
import { z } from "zod";
import { getAllCommunities } from "~/lib/community.server";
import { db } from "~/lib/prisma.server";
import { cn } from "~/lib/utils";
import { badRequest } from "~/utils/misc.server";
import type { inferErrors } from "~/utils/validation";
import { validateAction } from "~/utils/validation";

enum MODE {
  edit = 0,
  add = 1,
}

const ManageCommunitySchema = z.object({
  communityId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
});

export const loader = async () => {
  const communities = await getAllCommunities();

  return json({
    communities,
  });
};

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ManageCommunitySchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    ManageCommunitySchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  const { communityId, name } = fields;
  const id = new ObjectId();

  await db.community.upsert({
    where: {
      id: communityId || id.toString(),
    },
    update: {
      name,
    },
    create: {
      id: communityId || id.toString(),
      name,
    },
  });

  return json({
    success: true,
  });
};

export default function ManageProducts() {
  const fetcher = useFetcher<ActionData>();
  const { communities } = useLoaderData<typeof loader>();

  const [selectedCommunityId, setSelectedCommunityId] = React.useState<
    Community["id"] | null
  >(null);

  const [selectedCommunity, setSelectedCommunity] = React.useState<
    (typeof communities)[number] | null
  >(null);
  const [mode, setMode] = React.useState<MODE>(MODE.edit);
  const [isModalOpen, handleModal] = useDisclosure(false);

  const isSubmitting = fetcher.state !== "idle";

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (fetcher.state !== "idle" && fetcher.data === undefined) {
      return;
    }

    if (fetcher.data?.success) {
      setSelectedCommunityId(null);
      handleModal.close();
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [fetcher.data?.success, fetcher.state, fetcher.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (!selectedCommunityId) {
      setSelectedCommunity(null);
      return;
    }

    const community = communities.find(
      (community) => community.id === selectedCommunityId,
    );
    if (!community) {
      return;
    }

    setSelectedCommunity(community);
    handleModal.open();
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [communities, selectedCommunityId]);

  React.useEffect(() => {
    if (mode === MODE.add) {
      setSelectedCommunityId(null);
      setSelectedCommunity(null);
    }
  }, [mode]);

  return (
    <>
      <div className="p-5 w-full h-full overflow-x-hidden">
        <div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Manage Categories
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
              <span className="ml-2">Add Community</span>
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
                  {communities.map((community) => (
                    <tr key={community.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
                        {community.name}
                      </td>

                      <td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6 md:pr-0">
                        <div className="flex items-center gap-6">
                          <Button
                            loading={isSubmitting}
                            variant="subtle"
                            onClick={() => {
                              setSelectedCommunityId(community.id);
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
          setSelectedCommunityId(null);
          handleModal.close();
        }}
        title={cn({
          "Edit community": mode === MODE.edit,
          "Add community": mode === MODE.add,
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
              name="communityId"
              value={selectedCommunity?.id}
            />

            <TextInput
              name="name"
              label="Name"
              defaultValue={selectedCommunity?.name}
              error={fetcher.data?.fieldErrors?.name}
              required={true}
            />

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
                {mode === MODE.edit ? "Save changes" : "Add Community"}
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  );
}
