"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, ShoppingBag } from "lucide-react"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { Input } from "@/components/ui/input"

type DashboardClientProps = {
  totalProducts: number;
  totalCategories: number;
  sales: any[];
  chartData: any[];
}

export function DashboardClient({ totalProducts, totalCategories, sales, chartData }: DashboardClientProps) {
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Filter completed sales
  const completedSales = sales.filter((sale: any) => sale.status !== 'CANCELED');

  // Filter sales for the selected date
  const selectedDateSales = completedSales.filter((sale: any) => {
    if (!selectedDate) return true;
    const saleDateObj = new Date(sale.createdAt);
    const yyyy = saleDateObj.getFullYear();
    const mm = String(saleDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(saleDateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` === selectedDate;
  });

  const totalSalesAmount = selectedDateSales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount), 0);

  // Calculate total quantity sold for the selected date
  const quantitySold = selectedDateSales.reduce((sum: number, sale: any) => {
    const details = sale.saleDetails || [];
    return sum + details.reduce((qtySum: number, detail: any) => qtySum + Number(detail.quantity || 0), 0);
  }, 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Selamat datang kembali, Admin! Berikut ringkasan toko Anda.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border shadow-sm">
          <span className="text-sm font-medium text-muted-foreground pl-2">Pilih Tanggal:</span>
          <Input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 border-0 bg-gray-50 focus-visible:ring-1"
          />
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Total Produk */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-row items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-sm font-medium text-muted-foreground">Total Produk Master</span>
              <span className="text-2xl font-bold text-gray-900">{totalProducts}</span>
              <div className="flex items-center text-xs font-semibold text-green-600 mt-1">
                <span>Di dalam {totalCategories} Kategori</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Penjualan Hari Ini */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-row items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-sm font-medium text-muted-foreground">Total Pendapatan</span>
              <span className="text-2xl font-bold text-gray-900">Rp {totalSalesAmount.toLocaleString('id-ID')}</span>
              <div className="flex items-center text-xs font-semibold text-blue-600 mt-1">
                <span>Berdasarkan tanggal terpilih</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quantity Terjual */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 flex flex-row items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-sm font-medium text-muted-foreground">Produk Terjual</span>
              <span className="text-2xl font-bold text-gray-900">{quantitySold} Item</span>
              <div className="flex items-center text-xs font-semibold text-orange-600 mt-1">
                <span>Berdasarkan tanggal terpilih</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Grafik Penjualan */}
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden md:col-span-12 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Grafik Penjualan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-4 pt-2">
            <SalesChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
