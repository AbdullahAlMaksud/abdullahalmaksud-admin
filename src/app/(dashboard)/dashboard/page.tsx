import { AppSidebar } from "@/components/dashboard-01/components/app-sidebar"
import { SectionCards } from "@/components/dashboard-01/components/section-cards"
import { ModuleDistributionChart } from "@/components/modules/dashboard/module-distribution-chart"
import { LiveActivityTable } from "@/components/modules/dashboard/live-activity-table"
import { SiteHeader } from "@/components/dashboard-01/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-4 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ModuleDistributionChart />
              </div>
              <LiveActivityTable />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
