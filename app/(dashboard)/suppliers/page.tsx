import { Plus, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuppliersPage() {
  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Supplier</h2>
          <p className="text-muted-foreground text-sm">Kelola data pemasok atau distributor obat.</p>
        </div>
        <Button className="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
        </Button>
      </div>
      
      <div className="mt-6 flex flex-col items-center justify-center p-12 border rounded-xl bg-gray-50/50 border-dashed">
        <Construction className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Modul Belum Tersedia</h3>
        <p className="text-muted-foreground text-sm max-w-sm text-center mt-1">Backend API untuk modul supplier belum diimplementasikan. Halaman ini masih dalam tahap konstruksi.</p>
      </div>
    </div>
  )
}
