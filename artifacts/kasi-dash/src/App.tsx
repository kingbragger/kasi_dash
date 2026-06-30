import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";

import { CartProvider } from "@/context/CartContext";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Order from "@/pages/order";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFailed from "@/pages/payment-failed";
import Careers from "@/pages/careers";
import ApplyDriver from "@/pages/apply-driver";
import ApplyVendor from "@/pages/apply-vendor";
import ApplyJob from "@/pages/apply-job";
import About from "@/pages/about";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Shop from "@/pages/shop";
import Cart from "@/pages/cart";
import StaffLogin from "@/pages/staff/login";
import StaffDashboard from "@/pages/staff/dashboard";
import StaffDriverApplications from "@/pages/staff/applications-drivers";
import StaffVendorApplications from "@/pages/staff/applications-vendors";
import StaffJobApplications from "@/pages/staff/applications-jobs";
import StaffCareers from "@/pages/staff/careers";
import StaffMap from "@/pages/staff/map";
import StaffOrders from "@/pages/staff/orders";
import StaffCatalogues from "@/pages/staff/catalogues";
import StaffVendors from "@/pages/staff/vendors";
import DriverLogin from "@/pages/driver/login";
import DriverDashboard from "@/pages/driver/dashboard";
import VendorLogin from "@/pages/vendor/login";
import VendorDashboard from "@/pages/vendor/dashboard";
import TrackOrder from "@/pages/track";
import Receipt from "@/pages/receipt";
import VendorPaymentSuccess from "@/pages/vendor-payment-success";
import VendorPaymentFailed from "@/pages/vendor-payment-failed";
import BuildForge from "@/pages/buildforge";
import StaffBuildForge from "@/pages/staff/buildforge";
import BuildforgeLogin from "@/pages/buildforge/login";
import BuildforgeChangePassword from "@/pages/buildforge/change-password";
import BuildforgeCompleteProfile from "@/pages/buildforge/complete-profile";
import BuildforgePortal from "@/pages/buildforge/portal";
import BuildforgeContract from "@/pages/buildforge/contract";
import Invest from "@/pages/invest";
import StaffInvest from "@/pages/staff/invest";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [location]);
  return null;
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  baseTheme: dark,
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#c9a227",
    colorForeground: "#fafafa",
    colorMutedForeground: "#a6a6a6",
    colorDanger: "#f87171",
    colorBackground: "#111111",
    colorInput: "#1e1e1e",
    colorInputForeground: "#fafafa",
    colorNeutral: "#333333",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: {
      backgroundColor: "#111111",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "1rem",
      width: "440px",
      maxWidth: "100%",
      overflow: "hidden",
      boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
    },
    card: { boxShadow: "none", border: "none", backgroundColor: "transparent", borderRadius: 0 },
    footer: { boxShadow: "none", border: "none", backgroundColor: "transparent", borderRadius: 0 },
    headerTitle: { color: "#fafafa", fontWeight: "700" },
    headerSubtitle: { color: "#a6a6a6" },
    socialButtonsBlockButtonText: { color: "#fafafa" },
    formFieldLabel: { color: "#a6a6a6", fontSize: "0.875rem" },
    footerActionLink: { color: "#c9a227", fontWeight: "500" },
    footerActionText: { color: "#a6a6a6" },
    dividerText: { color: "#a6a6a6" },
    identityPreviewEditButton: { color: "#c9a227" },
    formFieldSuccessText: { color: "#4ade80" },
    alertText: { color: "#fafafa" },
    logoBox: { display: "flex", justifyContent: "center", padding: "0.5rem 0" },
    logoImage: { height: "3.5rem", width: "auto" },
    socialButtonsBlockButton: {
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.04)",
    },
    formButtonPrimary: {
      backgroundColor: "#c9a227",
      color: "#0a0a0a",
      fontWeight: "700",
      boxShadow: "0 0 16px rgba(201,162,39,0.35)",
    },
    formFieldInput: {
      backgroundColor: "#1e1e1e",
      borderColor: "rgba(255,255,255,0.1)",
      color: "#fafafa",
    },
    footerAction: { borderTop: "1px solid rgba(255,255,255,0.05)" },
    dividerLine: { backgroundColor: "rgba(255,255,255,0.1)" },
    alert: {
      border: "1px solid rgba(255,255,255,0.1)",
      backgroundColor: "rgba(255,255,255,0.04)",
    },
    otpCodeFieldInput: {
      backgroundColor: "#1e1e1e",
      borderColor: "rgba(255,255,255,0.1)",
      color: "#fafafa",
    },
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/order" component={Order} />
      <Route path="/shop" component={Shop} />
      <Route path="/cart" component={Cart} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failed" component={PaymentFailed} />
      <Route path="/vendor-payment/success" component={VendorPaymentSuccess} />
      <Route path="/vendor-payment/failed" component={VendorPaymentFailed} />
      <Route path="/careers" component={Careers} />
      <Route path="/careers/:id" component={ApplyJob} />
      <Route path="/apply/driver" component={ApplyDriver} />
      <Route path="/apply/vendor" component={ApplyVendor} />
      <Route path="/staff/login" component={StaffLogin} />
      <Route path="/staff" component={StaffDashboard} />
      <Route path="/staff/orders" component={StaffOrders} />
      <Route path="/staff/map" component={StaffMap} />
      <Route path="/staff/catalogues" component={StaffCatalogues} />
      <Route path="/staff/applications/drivers" component={StaffDriverApplications} />
      <Route path="/staff/applications/vendors" component={StaffVendorApplications} />
      <Route path="/staff/applications/jobs" component={StaffJobApplications} />
      <Route path="/staff/vendors" component={StaffVendors} />
      <Route path="/staff/careers" component={StaffCareers} />
      <Route path="/driver/login" component={DriverLogin} />
      <Route path="/driver" component={DriverDashboard} />
      <Route path="/vendor/login" component={VendorLogin} />
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/buildforge" component={BuildForge} />
      <Route path="/buildforge/login" component={BuildforgeLogin} />
      <Route path="/buildforge/change-password" component={BuildforgeChangePassword} />
      <Route path="/buildforge/complete-profile" component={BuildforgeCompleteProfile} />
      <Route path="/buildforge/portal" component={BuildforgePortal} />
      <Route path="/buildforge/contract" component={BuildforgeContract} />
      <Route path="/staff/buildforge" component={StaffBuildForge} />
      <Route path="/invest" component={Invest} />
      <Route path="/staff/invest" component={StaffInvest} />
      <Route path="/track/:orderId" component={TrackOrder} />
      <Route path="/receipt/:orderId" component={Receipt} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your Kasi Dash account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Join Kasi Dash and get started",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <CartProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
