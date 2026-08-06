import { fetchApi } from "@/lib/api"
import SalesClient from "./client"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  let products = []
  let users = []
  
  try {
    const [productsRes, usersRes] = await Promise.all([
      fetchApi('/products', { cache: 'no-store' }),
      fetchApi('/users', { cache: 'no-store' })
    ])
    products = productsRes
    users = usersRes
  } catch (error) {
    console.error("Failed to fetch data for POS:", error)
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Penjualan (Kasir)</h2>
        <p className="text-muted-foreground text-sm">Pilih produk dan catat transaksi dengan mudah.</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <SalesClient initialProducts={products} users={users} />
      </div>
    </div>
  )
}
