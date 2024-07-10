import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/client/stores/auth";

export const GuestGuard = () => {
  const isLoggedIn = useAuthStore((state) => !!state.user);

  // const [searchParams] = useSearchParams();
  //  searchParams.get("redirect")
  const redirect = "/resume-chat";

  if (isLoggedIn) {
    return <Navigate to={redirect} />;
  }

  return <Outlet />;
};
