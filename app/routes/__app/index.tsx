import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "@remix-run/react";
import * as React from "react";
import { useOptionalUser } from "~/utils/hooks";

type ActionData = Partial<{
  success: boolean;
  message: string;
}>;

// export async function action({ request }: ActionArgs) {
//   const formData = await request.formData();

//   const userId = await getUserId(request);

//   if (!userId) {
//     return json({ success: false, message: "Unauthorized" }, { status: 401 });
//   }

//   const stringifiedProducts = formData.get("products[]")?.toString();
//   const amount = formData.get("amount")?.toString();
//   const tax = formData.get("tax")?.toString();
//   const paymentMethod = formData.get("paymentMethod")?.toString();
//   const orderType = formData.get("orderType")?.toString();
//   const address = formData.get("address")?.toString();
//   const pickupTime = formData.get("pickupTime")?.toString();

//   if (!stringifiedProducts || !amount || !paymentMethod || !tax) {
//     return badRequest<ActionData>({
//       success: false,
//       message: "Invalid request body",
//     });
//   }

//   if (orderType === OrderType.DELIVERY && !address) {
//     return badRequest<ActionData>({
//       success: false,
//       message: "Address is required for delivery",
//     });
//   }

//   if (orderType === OrderType.PICKUP && !pickupTime) {
//     return badRequest<ActionData>({
//       success: false,
//       message: "Pickup time is required for pickup",
//     });
//   }

//   const products = JSON.parse(stringifiedProducts) as Array<CartItem>;

//   await createOrder({
//     userId,
//     products,
//     tax: Number(tax),
//     amount: Number(amount),
//     paymentMethod: paymentMethod as PaymentMethod,
//     orderType: orderType as OrderType,
//     address: address || "",
//     pickupTime: pickupTime ? new Date(pickupTime) : null,
//   });

//   return redirect("/order-history/?success=true");
// }

export default function Cart() {
  const { user } = useOptionalUser();
  const navigate = useNavigate();
  const [isSearchModalOpen, handleOpenSearchModal] = useDisclosure(false, {
    onClose: () => {
      setQuery("");
      setError("");
    },
  });
  const [query, setQuery] = React.useState("");
  const [error, setError] = React.useState("");

  return (
    // <div className="flex h-full flex-col gap-4 overflow-hidden">
    //   <div className="flex w-full items-center justify-between border-b border-b-gray-500 pb-4">
    //     <div className="flex items-center gap-4">
    //       <Button variant="outline" component={Link} to="/items">
    //         View all items
    //       </Button>
    //       <Button
    //         variant="filled"
    //         color="white"
    //         onClick={() => handleOpenSearchModal.open()}
    //       >
    //         <MagnifyingGlassIcon className="mr-2 h-4 w-4" aria-hidden="true" />
    //         <p>Search via barcode</p>
    //       </Button>
    //     </div>

    //     <div>
    //       <p className="text-sm">{formatDateTime(new Date())}</p>
    //     </div>
    //   </div>

    //   <div className="flex-1 overflow-y-auto p-4">
    //     <div className="flex flex-col gap-12">
    //       {itemsInCart.length > 0 ? <CartItems /> : <EmptyState />}
    //     </div>
    //   </div>

    //   <div className="border-t border-t-gray-500 p-4">
    //     {itemsInCart.length > 0 ? (
    //       <div className="flex items-center justify-between">
    //         <div className="space-x-2">
    //           <Button
    //             variant="filled"
    //             loading={isSubmitting}
    //             onClick={() => showPaymentModal()}
    //           >
    //             Pay Now
    //           </Button>
    //           <Button
    //             variant="outline"
    //             color="red"
    //             onClick={() => clearCart()}
    //             disabled={isSubmitting}
    //           >
    //             Clear items
    //           </Button>
    //         </div>

    //         <div className="flex flex-col gap-2">
    //           <p>Tax: ${tax.toFixed(2)}</p>
    //           <p>Total: ${totalPrice.toFixed(2)}</p>
    //         </div>
    //       </div>
    //     ) : null}
    //   </div>

    //   <Modal
    //     opened={isSearchModalOpen}
    //     onClose={handleOpenSearchModal.close}
    //     title="Search for a product"
    //     centered={true}
    //     overlayBlur={15}
    //     overlayOpacity={0.5}
    //   >
    //     <div className="flex flex-col gap-4">
    //       <TextInput
    //         label="Enter barcode Id"
    //         name="barcodeId"
    //         value={query}
    //         onChange={(event) => setQuery(event.currentTarget.value)}
    //         required={true}
    //         autoFocus={true}
    //       />

    //       {error && (
    //         <div className="text-sm font-medium text-red-500">{error}</div>
    //       )}

    //       <Button
    //         type="submit"
    //         variant="filled"
    //         fullWidth={true}
    //         onClick={() => {
    //           const product = products.find(
    //             (product) => product.barcodeId === query,
    //           );

    //           if (!product) {
    //             setError("Product not found");
    //             return;
    //           }

    //           navigate(`/product/${product.slug}`);
    //         }}
    //       >
    //         Search
    //       </Button>
    //     </div>
    //   </Modal>

    //   <Modal
    //     opened={isPaymentModalOpen}
    //     onClose={closePaymentModal}
    //     title="Payment"
    //     centered={true}
    //     overlayBlur={1}
    //     overlayOpacity={0.7}
    //   >
    //     <fetcher.Form
    //       method="post"
    //       className="flex flex-col gap-4"
    //       onSubmit={(e) => {
    //         e.preventDefault();

    //         const formData = new FormData(e.currentTarget);

    //         setErrors({
    //           cardNumber: "",
    //           cardExpiry: "",
    //           cardCvv: "",
    //         });

    //         if (cardNumber.replace(/[_ ]/g, "").length !== 16) {
    //           setErrors((prevError) => ({
    //             ...prevError,
    //             cardNumber: "Card number must be 16 digits",
    //           }));
    //         }

    //         if (!cardExpiry) {
    //           setErrors((prevError) => ({
    //             ...prevError,
    //             cardExpiry: "Card expiry is required",
    //           }));
    //         }

    //         if (!cardCvv || cardCvv.length !== 3) {
    //           setErrors((prevError) => ({
    //             ...prevError,
    //             cardCvv: "Card CVV must be 3 digits",
    //           }));
    //         }

    //         if (Object.values(errors).some((error) => error !== "")) {
    //           return;
    //         }

    //         formData.append("products[]", JSON.stringify(itemsInCart));
    //         formData.append("amount", totalPrice.toString());
    //         formData.append("tax", tax.toString());
    //         formData.append("orderType", orderType);
    //         formData.append("paymentMethod", paymentMethod);

    //         fetcher.submit(formData, {
    //           method: "post",
    //           replace: true,
    //         });
    //       }}
    //     >
    //       <div className="flex flex-col gap-2">
    //         <h2 className="text-sm text-gray-600">
    //           <span className="font-semibold">Amount: </span>
    //           <span>${totalPrice.toFixed(2)}</span>
    //         </h2>
    //       </div>

    //       <Select
    //         label="Order type"
    //         value={orderType}
    //         clearable={false}
    //         onChange={(e) => setOrderType(e as OrderType)}
    //         data={Object.values(OrderType).map((type) => ({
    //           label: titleCase(type.replace(/_/g, " ")),
    //           value: type,
    //         }))}
    //       />

    //       <Select
    //         label="Payment method"
    //         value={paymentMethod}
    //         clearable={false}
    //         onChange={(e) => setPaymentMethod(e as PaymentMethod)}
    //         data={Object.values(PaymentMethod).map((method) => ({
    //           label: titleCase(method.replace(/_/g, " ")),
    //           value: method,
    //         }))}
    //       />
    //       {!isCashPayment && (
    //         <>
    //           <Input.Wrapper
    //             id={id}
    //             label="Credit card number"
    //             required={true}
    //             error={errors.cardNumber}
    //           >
    //             <Input
    //               id={id}
    //               component={ReactInputMask}
    //               mask="9999 9999 9999 9999"
    //               placeholder="XXXX XXXX XXXX XXXX"
    //               alwaysShowMask={false}
    //               value={cardNumber}
    //               onChange={(e) => setCardNumber(e.target.value)}
    //             />
    //           </Input.Wrapper>

    //           <div className="flex items-center gap-4">
    //             <Input.Wrapper
    //               id={`${id}cvv`}
    //               label="CVV"
    //               required={true}
    //               error={errors.cardCvv}
    //             >
    //               <Input
    //                 id={`${id}cvv`}
    //                 name="cvv"
    //                 component={ReactInputMask}
    //                 mask="999"
    //                 placeholder="XXX"
    //                 alwaysShowMask={false}
    //                 value={cardCvv}
    //                 onChange={(e) => setCardCvv(e.target.value)}
    //               />
    //             </Input.Wrapper>

    //             <DatePicker
    //               name="expiryDate"
    //               label="Expiry"
    //               inputFormat="MM/YYYY"
    //               clearable={false}
    //               placeholder="MM/YYYY"
    //               labelFormat="MM/YYYY"
    //               required={true}
    //               value={cardExpiry}
    //               minDate={new Date()}
    //               onChange={(e) => setCardExpiry(e)}
    //               error={errors.cardExpiry}
    //               initialLevel="year"
    //               hideOutsideDates={true}
    //             />
    //           </div>
    //         </>
    //       )}

    //       {isDelivery ? (
    //         <Textarea
    //           label="Delivery address"
    //           name="address"
    //           value={address}
    //           onChange={(e) => setAddress(e.target.value)}
    //           required={true}
    //         />
    //       ) : (
    //         <div>
    //           <TimeInput
    //             label="Pickup time"
    //             name="pickupTime"
    //             clearable={false}
    //             format="12"
    //             value={pickUpTime}
    //             onChange={(e) => setPickUpTime(e)}
    //             required={true}
    //           />
    //         </div>
    //       )}

    //       <div className="mt-6 flex items-center gap-4 sm:justify-end">
    //         <Button
    //           variant="subtle"
    //           color="red"
    //           onClick={() => closePaymentModal()}
    //         >
    //           Cancel
    //         </Button>

    //         <Button
    //           variant="filled"
    //           type="submit"
    //           loading={isSubmitting}
    //           loaderPosition="right"
    //         >
    //           Place order
    //         </Button>
    //       </div>
    //     </fetcher.Form>
    //   </Modal>
    // </div>
    <div>this is index page of app folder</div>
  );
}

function EmptyState() {
  return (
    <div className="relative block h-full w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <ShoppingCartIcon className="mx-auto h-9 w-9 text-gray-500" />
      <span className="mt-4 block text-sm font-medium text-gray-500">
        Add items to your cart and they will appear here
      </span>
    </div>
  );
}
