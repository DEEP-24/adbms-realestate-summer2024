// export default function UserMenu({ currentUser }) => {
//   const loginModal = useLoginModal();
//   const registerModal = useRegisterModal();

//   const [isOpen, setIsOpen] = useState(false);

//   const toggleOpen = useCallback(() => {
//     setIsOpen((value) => !value);
//   }, [currentUser]);

//   return (
//     <div className="relative">
//       <div className="flex flex-row items-center gap-3">
//         {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
//         <div
//           onClick={toggleOpen}
//           className="p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 flex flex-row items-center gap-3 rounded-full cursor-pointer hover:shadow-md transition"
//         >
//           <AiOutlineMenu />
//         </div>
//       </div>
//       {isOpen && (
//         <div className="absolute rounded-xl shadow-md w-[10vw] bg-white overflow-hidden right-0 top-12 text-sm">
//           <div className="flex flex-col cursor-pointer items-center justify-center">
//             {currentUser ? (
//               <>
//                 {currentUser.role === UserRole.USER ? (
//                   <MenuItem
//                     label="My reservations"
//                     onClick={() => router.push("/reservations")}
//                   />
//                 ) : null}
//                 {currentUser.role === UserRole.PROPERTY_MANAGER ? (
//                   <MenuItem
//                     label="My properties"
//                     onClick={() => router.push("/properties")}
//                   />
//                 ) : null}
//                 <hr />
//                 {currentUser.role === UserRole.ADMIN ? (
//                   <MenuItem
//                     label="Properties"
//                     onClick={() => router.push("/admin")}
//                   />
//                 ) : null}
//                 <MenuItem label="Logout" onClick={() => signOut()} />
//               </>
//             ) : (
//               <>
//                 <MenuItem label="Login" onClick={loginModal.onOpen} />
//                 <MenuItem label="Sign up" onClick={registerModal.onOpen} />
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

