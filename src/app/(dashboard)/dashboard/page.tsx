import { SectionCards } from "@/components/dashboard-01/components/section-cards"
import { ModuleDistributionChart } from "@/components/modules/dashboard/module-distribution-chart"
import { LiveActivityTable } from "@/components/modules/dashboard/live-activity-table"
import { PageSubHeader } from "@/components/dashboard-01/components/sticky-action-bar"

export default function DashboardPage() {
  return (
    <div className="@container/main flex flex-1 min-w-0 flex-col w-full">
      <PageSubHeader
        description="Monitor portfolio statistics, module distribution, server health, and synchronized live activity."
      />
      <div className="flex flex-col gap-6 py-4 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ModuleDistributionChart />
        </div>
        <LiveActivityTable />
      </div>
    </div>
  )
}
