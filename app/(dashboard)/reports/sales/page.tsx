import { fetchApi } from "@/lib/api"
import { SalesHistoryClient } from "./client"

export default async function SalesHistoryPage() {
  let sales = []
  try {
    sales = await fetchApi('/sales')
  } catch (error: any) {
    console.log("Sales History: ", error.message)
  }

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <SalesHistoryClient data={sales} />
    </div>
  )
}
