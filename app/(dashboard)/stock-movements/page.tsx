import { Construction } from "lucide-react"

export default function StockMovementsPage() {
  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pergerakan Stok</h2>
          <p className="text-muted-foreground text-sm">Lihat laporan keluar masuk stok barang (Stock in/out).</p>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col items-center justify-center p-12 border rounded-xl bg-gray-50/50 border-dashed">
        <Construction className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Modul Belum Tersedia</h3>
        <p className="text-muted-foreground text-sm max-w-sm text-center mt-1">Backend API untuk laporan stok belum diimplementasikan. Halaman ini masih dalam tahap konstruksi.</p>
      </div>
    </div>
  )
}
