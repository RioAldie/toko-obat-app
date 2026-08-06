"use client"

import { useState, useTransition } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRecord, deleteRecord } from "@/lib/actions"
import { toast } from "sonner"

export type User = {
  id: string
  username: string
  role: string
  isActive: boolean
}

export function UserClient({ data }: { data: User[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => <div className="font-semibold text-gray-900">{row.getValue("username")}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="font-medium text-gray-700">{row.getValue("role")}</div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isActive ? 'Aktif' : 'Non-aktif'}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id
        const isDeleting = deletePending && deletingId === id
        
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(id)}
              disabled={deletePending || row.original.role === 'ADMIN'}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-red-600"
              title={row.original.role === 'ADMIN' ? "Admin tidak dapat dihapus" : "Hapus Pengguna"}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        )
      },
    },
  ]

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return
    
    setDeletingId(id)
    startDeleteTransition(async () => {
      const res = await deleteRecord('/users', id, '/users')
      if (res.success) {
        toast.success("Pengguna berhasil dihapus!")
      } else {
        toast.error("Gagal menghapus pengguna: " + res.error)
      }
      setDeletingId(null)
    })
  }

  async function onSubmit(formData: FormData) {
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
      isActive: formData.get("isActive") === "true",
    }

    startTransition(async () => {
      const res = await createRecord('/users', data, '/users')
      if (res.success) {
        toast.success("Pengguna berhasil ditambahkan!")
        setIsOpen(false)
      } else {
        toast.error("Gagal menambahkan pengguna: " + res.error)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pengguna</h2>
          <p className="text-muted-foreground text-sm">Kelola akses staf dan peran di sistem.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm" />}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <form action={onSubmit} className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold text-foreground/90">Username</Label>
                <Input id="username" name="username" required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground/90">Password</Label>
                <Input id="password" name="password" type="password" required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-semibold text-foreground/90">Role</Label>
                  <select 
                    id="role" 
                    name="role" 
                    required 
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm shadow-inner transition-all ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="CASHIER">Kasir (Cashier)</option>
                    <option value="MANAGER">Manajer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="isActive" className="text-sm font-semibold text-foreground/90">Status Aktif</Label>
                  <select 
                    id="isActive" 
                    name="isActive" 
                    required 
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm shadow-inner transition-all ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Non-aktif</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-gradient-to-b from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-md transition-all rounded-xl h-10 px-8 font-medium">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Pengguna
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={data} searchKey="username" />
    </>
  )
}
