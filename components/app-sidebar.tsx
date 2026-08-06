"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  Home, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  Tags, 
  Award, 
  Scale, 
  Truck,
  LineChart,
  ClipboardList,
  Users,
  Settings,
  Leaf,
  Rocket,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const menuUtama = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Kasir", url: "/sales", icon: ShoppingCart },
  { title: "Produk", url: "/products", icon: Package },
  { title: "Kategori", url: "/categories", icon: Tags },
  { title: "Merek", url: "/brands", icon: Award },
  { title: "Satuan", url: "/units", icon: Scale },
]

const laporan = [
  { title: "Penjualan", url: "/reports/sales", icon: LineChart },
]

const pengaturan = [
  { title: "Pengguna", url: "/users", icon: Users },
  { title: "Pengaturan", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <Sidebar className="border-r border-border/40 bg-white">
      <SidebarHeader className="h-20 flex flex-row items-center gap-3 px-6 border-b border-transparent">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
          <Leaf className="h-6 w-6" />
        </div>
        <div className="flex mt-2 flex-col">
          <h4 className="text-lg font-bold leading-tight">Berkah Rezeki Tani</h4>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 gap-6 py-4 bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">MENU UTAMA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuUtama.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={pathname === item.url}
                    render={<Link href={item.url} />}
                    className="h-10 data-[active=true]:bg-green-100 data-[active=true]:text-primary data-[active=true]:font-medium transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">LAPORAN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {laporan.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={pathname === item.url}
                    render={<Link href={item.url} />}
                    className="h-10 data-[active=true]:bg-green-100 data-[active=true]:text-primary data-[active=true]:font-medium transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      
      </SidebarContent>

      <SidebarFooter className="p-4 bg-white">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Keluar</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
