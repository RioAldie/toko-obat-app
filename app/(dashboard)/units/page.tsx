import { fetchApi } from "@/lib/api"
import { UnitClient } from "./client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function UnitsPage() {
  let units = []
  try {
    units = await fetchApi('/units')
  } catch (error: any) {
    console.log("Units: ", error.message)
  }

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <UnitClient data={units} />
    </div>
  )
}
