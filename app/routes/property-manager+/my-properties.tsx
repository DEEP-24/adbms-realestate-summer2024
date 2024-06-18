import { PlusIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Modal,
  MultiSelect,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Property } from "@prisma/client";
import {
  json,
  type ActionFunction,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ObjectId } from "bson";
import * as React from "react";
import z from "zod";
import { Amenities } from "~/amenities";
import { db } from "~/lib/prisma.server";
import { getPropertiesByUserId } from "~/lib/properties.server";
import { requireUserId } from "~/lib/session.server";
import { getPropertyManager } from "~/lib/user.server";
import { cn } from "~/lib/utils";
import { PropertyType } from "~/property-type";
import { badRequest } from "~/utils/misc.server";
import { validateAction, type inferErrors } from "~/utils/validation";

enum MODE {
  edit = 0,
  add = 1,
}

const ManagePropertySchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageSrc: z.string().min(1, "Image is required"),
  bathCount: z.string().min(1, "Bath count is required"),
  bedCount: z.string().min(1, "Bed count is required"),
  location: z.string().min(1, "Location is required"),
  depositAmount: z.string().min(1, "Deposit amount is required"),
  price: z.string().min(1, "Price is required"),
  type: z.string().min(1, "Type is required"),
  amenities: z.string().min(1, "Amenities is required"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const properties = await getPropertiesByUserId(userId);
  return json({
    properties,
  });
}

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ManagePropertySchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const _propertyManager = await getPropertyManager(request);

  const communityId = _propertyManager!.community!.id;

  const { fields, fieldErrors } = await validateAction(
    request,
    ManagePropertySchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  const {
    propertyId,
    name,
    description,
    imageSrc,
    bathCount,
    bedCount,
    location,
    depositAmount,
    price,
    type,
    amenities,
  } = fields;

  console.log("Amenities", amenities);

  const id = new ObjectId();

  await db.property.upsert({
    where: {
      id: propertyId || id.toString(),
    },
    update: {
      name,
    },
    create: {
      id: propertyId || id.toString(),
      name,
      description,
      imageSrc,
      bathCount: Number(bathCount),
      bedCount: Number(bedCount),
      location,
      depositAmount: Number(depositAmount),
      price: Number(price),
      type,
      amenities: amenities.split(","),
      communityId: communityId,
    },
  });

  return json({
    success: true,
  });
};

export default function MyProperties() {
  const fetcher = useFetcher<ActionData>();
  const { properties } = useLoaderData<typeof loader>();

  const [selectedPropertyId, setSelectedPropertyId] = React.useState<
    Property["id"] | null
  >(null);

  const [selectedProperty, setSelectedProperty] = React.useState<
    (typeof properties)[number] | null
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
      setSelectedPropertyId(null);
      handleModal.close();
    }
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [fetcher.data?.success, fetcher.state, fetcher.data]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    if (!selectedPropertyId) {
      setSelectedProperty(null);
      return;
    }

    const property = properties.find(
      (community) => community.id === selectedPropertyId,
    );
    if (!property) {
      return;
    }

    setSelectedProperty(property);
    handleModal.open();
    // handleModal is not meemoized, so we don't need to add it to the dependency array
  }, [properties, selectedPropertyId]);

  React.useEffect(() => {
    if (mode === MODE.add) {
      setSelectedPropertyId(null);
      setSelectedProperty(null);
    }
  }, [mode]);

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-end">
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
            <span className="ml-2">Add Property</span>
          </Button>
        </div>
      </div>
      <div className="mt-3">
        {properties.length > 0 ? (
          <div className="p-5 grid grid-cols-4 gap-8 w-full">
            {properties.map((property) => (
              // @ts-ignore
              <div
                className="col-span-1 cursor-pointer group w-full"
                key={property.id}
              >
                <div className="flex flex-col gap-1">
                  <div className="overflow-hidden rounded-xl h-[200px] w-full">
                    <img
                      className="w-full h-auto object-cover group-hover:scale-110 transition"
                      src={property.imageSrc}
                      alt="Property"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {property.name}
                    <Button
                      loading={isSubmitting}
                      variant="subtle"
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        setMode(MODE.edit);
                      }}
                      size="xs"
                      className="text-white hover:bg-gray-600 hover:text-white border-2 rouned-md bg-gray-500"
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="">
                    {property.location}, ${property.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          setSelectedPropertyId(null);
          handleModal.close();
        }}
        title={cn({
          "Edit Property": mode === MODE.edit,
          "Add Property": mode === MODE.add,
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
              name="propertyId"
              value={selectedProperty?.id}
            />

            <TextInput
              name="name"
              label="Name"
              defaultValue={selectedProperty?.name}
              error={fetcher.data?.fieldErrors?.name}
              required={true}
            />

            <Textarea
              name="description"
              label="Description"
              defaultValue={selectedProperty?.description}
              error={fetcher.data?.fieldErrors?.description}
              required={true}
            />

            <TextInput
              name="imageSrc"
              label="Image URL"
              defaultValue={selectedProperty?.imageSrc}
              error={fetcher.data?.fieldErrors?.imageSrc}
              required={true}
            />

            <div className="flex items-center justify-center gap-2 w-full">
              <TextInput
                name="bathCount"
                label="Bathroom Count"
                type="number"
                defaultValue={selectedProperty?.bathCount}
                error={fetcher.data?.fieldErrors?.bathCount}
                required={true}
                className="w-full"
              />
              <TextInput
                name="bedCount"
                label="Bedroom Count"
                type="number"
                defaultValue={selectedProperty?.bedCount}
                error={fetcher.data?.fieldErrors?.bedCount}
                required={true}
                className="w-full"
              />
            </div>

            <TextInput
              name="location"
              label="Location"
              defaultValue={selectedProperty?.location}
              error={fetcher.data?.fieldErrors?.location}
              required={true}
            />

            <div className="flex items-center justify-center gap-2 w-full">
              <TextInput
                name="depositAmount"
                label="Deposit Amount"
                type="number"
                defaultValue={selectedProperty?.depositAmount}
                error={fetcher.data?.fieldErrors?.depositAmount}
                required={true}
                className="w-full"
              />
              <TextInput
                name="price"
                label="Price"
                type="number"
                defaultValue={selectedProperty?.price}
                error={fetcher.data?.fieldErrors?.price}
                required={true}
                className="w-full"
              />
            </div>

            <Select
              name="type"
              label="Type"
              data={Object.values(PropertyType).map((type) => ({
                value: type,
                label: type,
              }))}
              error={fetcher.data?.fieldErrors?.type}
              defaultValue={selectedProperty?.type}
              required={true}
              className="w-full"
            />

            <MultiSelect
              name="amenities"
              label="Amenities"
              data={Object.values(Amenities).map((amenity) => ({
                value: amenity,
                label: amenity,
              }))}
              error={fetcher.data?.fieldErrors?.amenities}
              defaultValue={selectedProperty?.amenities}
              required={true}
              className="w-full"
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
                {mode === MODE.edit ? "Save changes" : "Add product"}
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <span className="mt-4 block text-sm font-medium text-gray-500">
        There are no properties under you. Please add them.
      </span>
    </div>
  );
}
