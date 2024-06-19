import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Button, Modal, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { RequestStatus } from "@prisma/client";
import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import * as React from "react";
import z from "zod";
import { db } from "~/lib/prisma.server";
import { getPropertyById } from "~/lib/properties.server";
import { useOptionCustomer } from "~/utils/hooks";
import { badRequest } from "~/utils/misc.server";
import { validateAction, type inferErrors } from "~/utils/validation";

const ManageRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  ssn: z.string().min(1, "SSN is required"),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // const userId = await requireUserId(request);
  const { id } = params;

  const propertyRequest = await db.reservationRequest.findFirst({
    where: {
      propertyId: id,
    },
    select: {
      reservation: true,
      status: true,
      property: true,
      propertyId: true,
      startDate: true,
      endDate: true,
      ssn: true,
      user: true,
    },
  });

  if (!id) {
    return redirect("/properties");
  }

  const property = await getPropertyById(id as string);

  if (!property) {
    return redirect("/properties");
  }

  return json({ property, propertyRequest });
};

interface ActionData {
  success: boolean;
  fieldErrors?: inferErrors<typeof ManageRequestSchema>;
}

export const action: ActionFunction = async ({ request }) => {
  const { fields, fieldErrors } = await validateAction(
    request,
    ManageRequestSchema,
  );

  if (fieldErrors) {
    return badRequest<ActionData>({ success: false, fieldErrors });
  }

  const { userId, propertyId, startDate, endDate, ssn } = fields;

  await db.reservationRequest.create({
    data: {
      userId,
      propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: RequestStatus.PENDING,
      ssn: ssn,
    },
  });

  return json({
    success: true,
  });
};

export default function Property() {
  const user = useOptionCustomer();
  const fetcher = useFetcher<ActionData>();
  const { property, propertyRequest } = useLoaderData<typeof loader>();

  const [isModalOpen, handleModal] = useDisclosure(false);

  const [startDate, setStartDate] = React.useState<Date | null>(null);

  const isSubmitting = fetcher.state !== "idle";

  React.useEffect(() => {
    if (fetcher.state !== "idle" && fetcher.data === undefined) {
      return;
    }

    if (fetcher.data?.success) {
      handleModal.close();
    }
  }, [fetcher.data?.success, fetcher.state, fetcher.data, handleModal]);

  const propertyAlreadyReserved =
    propertyRequest?.reservation?.propertyId === property.id;

  return (
    <>
      <div className="flex flex-col gap-4 p-5">
        <div className="mx-auto max-w-screen sm:px-6 lg:grid lg:max-w-screen lg:grid-cols-3 lg:gap-x-10">
          <div className="sm:mt-10 lg:col-span-1 lg:mt-0">
            <div className="mb-5">
              <Button
                leftSection={<ArrowLeftIcon className="h-5 w-5" />}
                variant="white"
                size="md"
                component={Link}
                to=".."
                pl={0}
                color="black"
              >
                Back
              </Button>
            </div>
            <div className="lg:col-span-2 lg:self-end">
              <div className="mt-4">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  {property.name}
                </h1>
              </div>

              <section aria-labelledby="information-heading" className="mt-4">
                <p className="text-lg text-gray-900 sm:text-xl">
                  ${property.price}
                </p>

                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    {property.description}
                  </p>
                </div>

                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    <span className="text-black/90 font-semibold">
                      No of Bathrooms
                    </span>{" "}
                    : {property.bathCount}
                  </p>
                </div>

                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    <span className="text-black/90 font-semibold">
                      No of Bedrooms
                    </span>{" "}
                    : {property.bedCount}
                  </p>
                </div>
                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    <span className="text-black/90 font-semibold">
                      Location
                    </span>
                    : {property.location}
                  </p>
                </div>
                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    <span className="text-black/90 font-semibold">Type</span>:{" "}
                    {property.type}
                  </p>
                </div>

                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    <span className="text-black/90 font-semibold">
                      Deposit Amount
                    </span>
                    : ${property.depositAmount}
                  </p>
                </div>
                <div className="mt-4 space-y-6">
                  <p className="text-base text-gray-500">
                    <span className="text-black/90 font-semibold">
                      Amenities Provided
                    </span>
                    : {property.amenities.join(", ")}
                  </p>
                </div>
              </section>
              <div className="mt-5">
                <Button
                  color="black"
                  onClick={() => {
                    handleModal.open();
                  }}
                  disabled={
                    !property.isAvailable ||
                    propertyRequest?.status === RequestStatus.PENDING ||
                    propertyRequest?.status === RequestStatus.APPROVED ||
                    propertyAlreadyReserved
                  }
                  className="hover:bg-gray-600 w-full"
                >
                  {propertyRequest?.status === RequestStatus.PENDING
                    ? "Request Pending"
                    : "Request to Reserve"}
                </Button>
                {propertyAlreadyReserved && (
                  <span>This property is reserved by other user.</span>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg lg:col-span-2 h-[750px] w-auto">
            <img
              src={property.imageSrc}
              alt={property.name}
              className="w-full object-fill"
            />
          </div>
        </div>
      </div>

      <Modal
        opened={isModalOpen}
        onClose={() => {
          handleModal.close();
        }}
        title="Request to Reserve the property"
        centered={true}
        overlayProps={{ blur: "0.9", opacity: 0.9 }}
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}
      >
        <fetcher.Form method="post">
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <input type="hidden" name="propertyId" value={property.id} />

            <input type="hidden" name="userId" value={user?.id} />

            <DatePickerInput
              name="startDate"
              label="Start Date"
              required={true}
              minDate={new Date()}
              error={fetcher.data?.fieldErrors?.startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full"
              clearable={true}
            />

            <DatePickerInput
              name="endDate"
              label="End Date"
              minDate={startDate || new Date()}
              required={true}
              error={fetcher.data?.fieldErrors?.endDate}
              className="w-full"
              clearable={true}
            />

            <TextInput
              name="ssn"
              label="SSN"
              required={true}
              error={fetcher.data?.fieldErrors?.ssn}
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
              <Button type="submit" loading={isSubmitting} color="black">
                Request
              </Button>
            </div>
          </fieldset>
        </fetcher.Form>
      </Modal>
    </>
  );
}
