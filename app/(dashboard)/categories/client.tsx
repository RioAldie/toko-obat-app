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

export type Category = {
  id: string
  name: string
  description?: string
}

export function CategoryClient({ data }: { data: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Nama Kategori",
      cell: ({ row }) => <div className="font-semibold text-gray-900">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => <div className="text-gray-600">{row.getValue("description") || "-"}</div>,
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
              disabled={deletePending}
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        )
      },
    },
  ]

  async function handleDelete(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return
    
    setDeletingId(id)
    startDeleteTransition(async () => {
      const res = await deleteRecord('/categories', id, '/categories')
      if (res.success) {
        toast.success("Kategori berhasil dihapus!")
      } else {
        toast.error("Gagal menghapus kategori: " + res.error)
      }
      setDeletingId(null)
    })
  }

  async function onSubmit(formData: FormData) {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    startTransition(async () => {
      const res = await createRecord('/categories', data, '/categories')
      if (res.success) {
        toast.success("Kategori berhasil ditambahkan!")
        setIsOpen(false)
      } else {
        toast.error("Gagal menambahkan kategori: " + res.error)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Kategori</h2>
          <p className="text-muted-foreground text-sm">Kelola kategori produk untuk memudahkan pengelompokan obat.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm" />}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <form action={onSubmit} className="space-y-6 mt-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/90">Nama Kategori</Label>
                <Input id="name" name="name" placeholder="Misal: Obat Sirup" required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground/90">Deskripsi (Opsional)</Label>
                <Input id="description" name="description" placeholder="Deskripsi singkat tentang kategori ini" className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-gradient-to-b from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-md transition-all rounded-xl h-10 px-8 font-medium">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Kategori
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" />
    </>
  )
}
