"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/api"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Eye, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getRecord } from "@/lib/actions"
import { AlertModal } from "@/components/alert-modal"

export type Sale = {
  id: string
  invoiceNumber: string
  totalAmount: string | number
  status: string
  createdAt: string
  user: {
    id: string
    username: string
  }
  _count?: {
    saleDetails: number
  }
}

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function SalesHistoryClient({ data }: { data: Sale[] }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "default" | "destructive";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "default"
  })
  
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
  
  const router = useRouter()
  
  const [startDate, setStartDate] = useState(getTodayString())
  const [endDate, setEndDate] = useState(getTodayString())

  const filteredData = data.filter(sale => {
    if (!startDate && !endDate) return true
    
    const saleDate = new Date(sale.createdAt).getTime()
    
    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)
    
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23, 59, 59, 999)

    if (start && end) {
      return saleDate >= start.getTime() && saleDate <= end.getTime()
    } else if (start) {
      return saleDate >= start.getTime()
    } else if (end) {
      return saleDate <= end.getTime()
    }
    return true
  })

  const columns: ColumnDef<Sale>[] = [
    {
      id: "no",
      header: "No.",
      cell: ({ row }) => <div className="text-center text-gray-500 w-8">{row.index + 1}</div>,
    },
    {
      accessorKey: "invoiceNumber",
      header: "No. Invoice",
      cell: ({ row }) => <div className="font-semibold font-mono text-primary">{row.getValue("invoiceNumber")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Transaksi",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return <div className="text-gray-600">{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      },
    },
    {
      accessorKey: "user.username",
      header: "Kasir",
      cell: ({ row }) => <div className="text-gray-600 capitalize">{row.original.user?.username || '-'}</div>,
    },
    {
      accessorKey: "itemsCount",
      header: "Jumlah Item",
      cell: ({ row }) => <div className="text-gray-600">{row.original._count?.saleDetails || 0} Item</div>,
    },
    {
      accessorKey: "totalAmount",
      header: "Total Belanja",
      cell: ({ row }) => <div className="font-bold text-gray-900">Rp {Number(row.getValue("totalAmount")).toLocaleString('id-ID')}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "COMPLETED"
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {status}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetails(id)}
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" /> Detail
            </Button>
          </div>
        )
      },
    },
  ]

  async function handleViewDetails(id: string) {
    setIsLoading(true)
    setIsDetailOpen(true)
    try {
      const res = await getRecord(`/sales/${id}`)
      if (res.success) {
        setSelectedSale(res.data)
      } else {
        console.error("Gagal mengambil detail penjualan", res.error)
      }
    } catch (error) {
      console.error("Gagal mengambil detail penjualan", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCancelSale(id: string) {
    setAlertConfig({
      isOpen: true,
      title: "Batalkan Transaksi",
      description: "Apakah Anda yakin ingin membatalkan transaksi ini? Total penjualan akan dikurangi, tetapi riwayat tetap disimpan.",
      variant: "destructive",
      onConfirm: async () => {
        setIsLoading(true)
        try {
          const token = localStorage.getItem("token")
          const res = await fetch(`${API_URL}/sales/${id}/cancel`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          if (res.ok) {
            setAlertConfig({
              isOpen: true,
              title: "Berhasil",
              description: "Transaksi berhasil dibatalkan",
              variant: "default"
            })
            setIsDetailOpen(false)
            router.refresh()
          } else {
            setAlertConfig({
              isOpen: true,
              title: "Gagal",
              description: "Gagal membatalkan transaksi",
              variant: "destructive"
            })
          }
        } catch (error) {
          setAlertConfig({
            isOpen: true,
            title: "Error",
            description: "Terjadi kesalahan",
            variant: "destructive"
          })
        } finally {
          setIsLoading(false)
        }
      }
    })
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Riwayat Penjualan</h2>
          <p className="text-muted-foreground text-sm">Lihat semua transaksi penjualan yang telah berhasil dilakukan.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 bg-white p-3 rounded-xl border shadow-sm w-full md:w-auto">
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <span className="text-sm text-muted-foreground font-medium pl-2 md:pl-2 shrink-0">Dari</span>
            <Input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="h-9 border-0 bg-gray-50 focus-visible:ring-1 flex-1 md:w-auto"
            />
          </div>
          <span className="text-muted-foreground font-bold hidden md:block">-</span>
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <span className="text-sm text-muted-foreground font-medium pl-2 md:pl-0 shrink-0 md:hidden">Sampai</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="h-9 border-0 bg-gray-50 focus-visible:ring-1 flex-1 md:w-auto"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate("") }} className="text-muted-foreground hover:text-red-500 font-semibold text-xs h-9">
                Reset
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { 
                const today = getTodayString(); 
                setStartDate(today); 
                setEndDate(today); 
              }} 
              className="h-9 font-medium"
            >
              Hari Ini
            </Button>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} searchKey="invoiceNumber" />

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Detail Transaksi
            </DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selectedSale ? (
            <div className="space-y-6 mt-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">No. Invoice</p>
                  <p className="font-bold font-mono text-gray-900">{selectedSale.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedSale.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Kasir</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedSale.user?.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Nama Pembeli</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedSale.buyerName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Catatan</p>
                  <p className="font-semibold text-gray-900">{selectedSale.note || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selectedSale.status === "CANCELED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {selectedSale.status || "COMPLETED"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total</p>
                  <p className="font-bold text-primary text-lg">Rp {Number(selectedSale.totalAmount).toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Daftar Item</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {selectedSale.saleDetails?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{item.productName || item.product?.name || "Item Manual"}</span>
                        <span className="text-sm text-muted-foreground font-mono">{item.product?.sku || "MANUAL"}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">Harga</span>
                          <span className="font-medium">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-right w-12">
                          <span className="text-xs text-muted-foreground block">Qty</span>
                          <span className="font-medium">x{item.quantity}</span>
                        </div>
                        <div className="text-right w-24">
                          <span className="text-xs text-muted-foreground block">Subtotal</span>
                          <span className="font-bold text-primary">Rp {Number(item.subtotal).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSale.status !== 'CANCELED' && (
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="destructive" onClick={() => handleCancelSale(selectedSale.id)}>
                    Batalkan Transaksi
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">Data tidak ditemukan.</div>
          )}
        </DialogContent>
      </Dialog>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.onConfirm ? "Ya, Proses" : "OK"}
        cancelText="Batal"
      />
    </>
  )
}
