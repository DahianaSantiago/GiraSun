import { NavBar } from "@/components/NavBar";
import { SideRail } from "@/components/SideRail";
import { Footer } from "@/components/Footer";
import { SignInModal } from "@/components/auth/SignInModal";

/**
 * Public-surface layout — wraps every route in the (public) route group with
 * the sticky NavBar, the rotated SideRail (visible ≥1100 px), the linen
 * Footer, and the global SignInModal. The /admin segment doesn't get any of
 * this; it has its own shell.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <SideRail />
      <main>{children}</main>
      <Footer />
      <SignInModal />
    </>
  );
}
