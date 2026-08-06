"use client"

import { useState, useTransition } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRecord, deleteRecord, updateRecord } from "@/lib/actions"
import { toast } from "sonner"
import { AlertModal } from "@/components/alert-modal"

export type Product = {
  id: string
  sku: string
  name: string
  price: number | string
  stock: number
  categoryId: string
  unitId: string
  category?: { name: string }
  unit?: { name: string }
  description?: string
}

export function ProductClient({ 
  data, 
  categories, 
  units 
}: { 
  data: Product[], 
  categories: { id: string, name: string }[],
  units: { id: string, name: string }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deletePending, startDeleteTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editPending, startEditTransition] = useTransition()

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
  })

  const columns: ColumnDef<Product>[] = [
    {
      id: "no",
      header: "No.",
      cell: ({ row }) => <div className="text-center text-gray-500 w-8">{row.index + 1}</div>,
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("sku")}</div>,
    },
    {
      accessorKey: "name",
      header: "Nama Produk",
      cell: ({ row }) => <div className="font-semibold text-gray-800">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category.name",
      header: "Kategori",
      cell: ({ row }) => {
        const category = row.original.category?.name || "-"
        return <div className="text-gray-600">{category}</div>
      }
    },
    {
      accessorKey: "price",
      header: "Harga",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price") as string)
        const formatted = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0
        }).format(price)
        return <div className="font-medium text-gray-900">{formatted}</div>
      },
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id
        const isDeleting = deletePending && deletingId === id

        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(row.original)}
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
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
    setAlertConfig({
      isOpen: true,
      title: "Konfirmasi Hapus",
      description: "Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.",
      variant: "destructive",
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }))
        setDeletingId(id)
        startDeleteTransition(async () => {
          const res = await deleteRecord('/products', id, '/products')
          if (res.success) {
            toast.success("Produk berhasil dihapus!")
          } else {
            toast.error("Gagal menghapus produk: " + res.error)
          }
          setDeletingId(null)
        })
      },
      onCancel: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
    })
  }

  async function onSubmit(formData: FormData) {
    const data = {
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string,
      unitId: formData.get("unitId") as string,
      price: parseFloat(formData.get("price") as string),
    }

    startTransition(async () => {
      const res = await createRecord('/products', data, '/products')
      if (res.success) {
        toast.success("Produk berhasil ditambahkan!")
        setIsOpen(false)
      } else {
        toast.error("Gagal menambahkan produk: " + res.error)
      }
    })
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setIsEditOpen(true)
  }

  async function onEditSubmit(formData: FormData) {
    if (!editingProduct) return

    const data = {
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string,
      unitId: formData.get("unitId") as string,
      price: parseFloat(formData.get("price") as string),
    }

    startEditTransition(async () => {
      const res = await updateRecord('/products', editingProduct.id, data, '/products')
      if (res.success) {
        toast.success("Produk berhasil diperbarui!")
        setIsEditOpen(false)
        setEditingProduct(null)
      } else {
        toast.error("Gagal memperbarui produk: " + res.error)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Produk</h2>
          <p className="text-muted-foreground text-sm">Kelola daftar produk, stok, dan harga obat di toko Anda.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm" />}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <form action={onSubmit} className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="sku" className="text-sm font-semibold text-foreground/90">SKU (Kode Produk)</Label>
                  <Input id="sku" name="sku" placeholder="Misal: OB-001" required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground/90">Nama Produk</Label>
                  <Input id="name" name="name" placeholder="Misal: Paracetamol 500mg" required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground/90">Deskripsi (Opsional)</Label>
                <Input id="description" name="description" placeholder="Deskripsi obat..." className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="categoryId" className="text-sm font-semibold text-foreground/90">Kategori</Label>
                  <select 
                    id="categoryId" 
                    name="categoryId" 
                    defaultValue=""
                    required 
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm shadow-inner transition-all ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Pilih Kategori...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="unitId" className="text-sm font-semibold text-foreground/90">Satuan</Label>
                  <select 
                    id="unitId" 
                    name="unitId" 
                    defaultValue=""
                    required 
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm shadow-inner transition-all ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Pilih Satuan...</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="price" className="text-sm font-semibold text-foreground/90">Harga (Rp)</Label>
                <Input id="price" name="price" type="number" min="0" placeholder="0" required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-gradient-to-b from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-md transition-all rounded-xl h-10 px-8 font-medium">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Simpan Produk
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Produk</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <form action={onEditSubmit} className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="edit-sku" className="text-sm font-semibold text-foreground/90">SKU (Kode Produk)</Label>
                    <Input id="edit-sku" name="sku" defaultValue={editingProduct.sku} required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="edit-name" className="text-sm font-semibold text-foreground/90">Nama Produk</Label>
                    <Input id="edit-name" name="name" defaultValue={editingProduct.name} required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="edit-description" className="text-sm font-semibold text-foreground/90">Deskripsi (Opsional)</Label>
                  <Input id="edit-description" name="description" defaultValue={editingProduct.description || ""} className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="edit-categoryId" className="text-sm font-semibold text-foreground/90">Kategori</Label>
                    <select 
                      id="edit-categoryId" 
                      name="categoryId" 
                      defaultValue={editingProduct.categoryId}
                      required 
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm shadow-inner transition-all ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="edit-unitId" className="text-sm font-semibold text-foreground/90">Satuan</Label>
                    <select 
                      id="edit-unitId" 
                      name="unitId" 
                      defaultValue={editingProduct.unitId}
                      required 
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm shadow-inner transition-all ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="edit-price" className="text-sm font-semibold text-foreground/90">Harga (Rp)</Label>
                  <Input id="edit-price" name="price" type="number" min="0" defaultValue={editingProduct.price} required className="bg-muted/20 border-border/50 focus-visible:ring-primary/20 shadow-inner" />
                </div>

                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">Batal</Button>
                  <Button type="submit" disabled={editPending} className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all rounded-xl h-10 px-8 font-medium">
                    {editPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Perbarui Produk
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" />
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.onConfirm ? "Ya, Hapus" : "OK"}
        cancelText="Batal"
      />
    </>
  )
}
