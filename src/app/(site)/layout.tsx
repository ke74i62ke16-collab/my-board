import SiteHeaderWithNav from "@/components/SiteHeaderWithNav";
import SiteFooter from "@/components/SiteFooter";
import FloatingRefreshButton from "@/components/FloatingRefreshButton";
import { RefreshCallbackProvider } from "@/components/RefreshCallbackContext";
import { ActiveCategoryProvider } from "@/components/ActiveCategoryContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActiveCategoryProvider>
      <RefreshCallbackProvider>
        <SiteHeaderWithNav />
        {children}
        <SiteFooter />
        <FloatingRefreshButton />
      </RefreshCallbackProvider>
    </ActiveCategoryProvider>
  );
}
