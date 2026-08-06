import { fetchApi } from "@/lib/api"
import { ProductClient } from "./client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
  let products = []
  let categories = []
  let units = []
  
  try {
    const [p, c, u] = await Promise.all([
      fetchApi('/products').catch(() => []),
      fetchApi('/categories').catch(() => []),
      fetchApi('/units').catch(() => [])
    ])
    products = p
    categories = c
    units = u
  } catch (error: any) {
    console.log("Products: ", error.message)
  }

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <ProductClient data={products} categories={categories} units={units} />
    </div>
  )
}
