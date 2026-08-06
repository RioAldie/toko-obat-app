import { fetchApi } from "@/lib/api"
import { CategoryClient } from "./client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CategoriesPage() {
  let categories = []
  try {
    categories = await fetchApi('/categories')
  } catch (error: any) {
    console.log("Categories: ", error.message)
  }

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <CategoryClient data={categories} />
    </div>
  )
}
