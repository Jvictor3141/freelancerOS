import { DashboardAlertsPanel } from '../features/dashboard/DashboardAlertsPanel'
import { DashboardErrorBanner } from '../features/dashboard/DashboardErrorBanner'
import { DashboardFinancialOverview } from '../features/dashboard/DashboardFinancialOverview'
import { DashboardLoadingState } from '../features/dashboard/DashboardLoadingState'
import { DashboardRecentActivitiesPanel } from '../features/dashboard/DashboardRecentActivitiesPanel'
import { DashboardRevenueSection } from '../features/dashboard/DashboardRevenueSection'
import { DashboardSummaryMetrics } from '../features/dashboard/DashboardSummaryMetrics'
import { useDashboardData } from '../features/dashboard/useDashboardData'

export function DashboardPage() {
  const {
    combinedError,
    isLoading,
    metrics,
    paymentAlerts,
    paymentMetrics,
    recentActivities,
    revenue,
  } = useDashboardData()

  if (isLoading) {
    return <DashboardLoadingState />
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? <DashboardErrorBanner message={combinedError} /> : null}

      <section className="grid gap-4 xl:grid-cols-12">
        <DashboardFinancialOverview paymentMetrics={paymentMetrics} />
        <DashboardAlertsPanel alerts={paymentAlerts} />
      </section>

      <DashboardSummaryMetrics metrics={metrics} />

      <section className="grid gap-6 xl:grid-cols-12">
        <DashboardRevenueSection
          data={revenue}
          totalReceived={paymentMetrics.receivedAmount}
        />
        <DashboardRecentActivitiesPanel activities={recentActivities} />
      </section>
    </div>
  )
}

