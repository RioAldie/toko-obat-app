import { fetchApi } from "@/lib/api"
import { UserClient } from "./client"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  let users = []
  try {
    users = await fetchApi('/users')
  } catch (error: any) {
    console.log("Users: ", error.message)
  }

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto pb-10">
      <UserClient data={users} />
    </div>
  )
}
