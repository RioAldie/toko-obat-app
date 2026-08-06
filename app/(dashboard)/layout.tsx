import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/30">
        <header className="flex h-20 shrink-0 items-center gap-4 px-6 md:px-8">
          <SidebarTrigger className="h-6 w-6 text-muted-foreground" />
        </header>
        <div className="p-4 md:p-6 lg:p-8 pt-0">
          {children}
        </div>
      </main>
    </SidebarProvider>
    </AuthGuard>
  )
}
