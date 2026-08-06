import { DashboardClient } from "./client"
import { fetchApi } from "@/lib/api"

async function getStats() {
  try {
    const [products, categories, sales] = await Promise.all([
      fetchApi('/products').catch(() => []),
      fetchApi('/categories').catch(() => []),
      fetchApi('/sales').catch(() => [])
    ])

    const completedSales = (sales || []).filter((sale: any) => sale.status !== 'CANCELED');

    const salesDataByDate = completedSales.reduce((acc: any, sale: any) => {
      const dateObj = new Date(sale.createdAt);
      const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      acc[dateStr] = (acc[dateStr] || 0) + Number(sale.totalAmount);
      return acc;
    }, {});

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return { date: dateStr, sales: salesDataByDate[dateStr] || 0 };
    });

    return {
      totalProducts: products?.length || 0,
      totalCategories: categories?.length || 0,
      sales: sales || [],
      chartData
    }
  } catch (error) {
    return {
      totalProducts: 0,
      totalCategories: 0,
      sales: [],
      chartData: []
    }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return <DashboardClient {...stats} />
}
