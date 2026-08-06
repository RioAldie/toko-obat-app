"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle2, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRecord } from "@/lib/actions"
import { AlertModal } from "@/components/alert-modal"

type Product = {
  category: any
  id: string
  name: string
  price: string | number
  stock: number
  sku: string
}

type User = {
  id: string
  username: string
}

type CartItem = {
  product: Product
  quantity: number | string
}

export default function SalesClient({ initialProducts, users }: { initialProducts: Product[], users: User[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>(users.length > 0 ? users[0].id : "")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customQuantity, setCustomQuantity] = useState("1")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [buyerName, setBuyerName] = useState("")
  const [note, setNote] = useState("")

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "default" | "destructive";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "default"
  })
  
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
  
  const router = useRouter()

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (product: Product) => {

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: (Number(item.quantity) + 1) } 
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const addCustomToCart = () => {
    if (!customName || !customPrice || !customQuantity) return

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: customName,
      price: Number(customPrice),
      stock: 0,
      sku: "MANUAL",
      category: undefined
    }

    setCart(prev => [...prev, { product: newProduct, quantity: Number(customQuantity) }])
    setIsCustomModalOpen(false)
    setCustomName("")
    setCustomPrice("")
    setCustomQuantity("1")
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const currentQty = typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity
        return { ...item, quantity: Math.max(0.01, currentQty + delta) }
      }
      return item
    }))
  }

  const setQuantityDirect = (productId: string, value: string) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: value }
      }
      return item
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    if (!selectedUserId) {
      setAlertConfig({
        isOpen: true,
        title: "Perhatian",
        description: "Pilih kasir terlebih dahulu!",
        variant: "destructive"
      })
      return
    }

    setAlertConfig({
      isOpen: true,
      title: "Konfirmasi Transaksi",
      description: "Apakah Anda yakin ingin memproses transaksi ini?",
      variant: "default",
      onConfirm: async () => {
        setIsLoading(true)
        const payload = {
          userId: selectedUserId,
          buyerName: buyerName || undefined,
          note: note || undefined,
          items: cart.map(item => {
            if (item.product.id.startsWith('custom-')) {
              return {
                productName: item.product.name,
                price: Number(item.product.price),
                quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity
              }
            }
            return {
              productId: item.product.id,
              quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity
            }
          })
        }

        const res = await createRecord('/sales', payload, '/sales')
        
        if (res.success) {
          setSuccess(true)
          setCart([])
          setBuyerName("")
          setNote("")
          
          setTimeout(() => {
            setSuccess(false)
            router.refresh() // Refresh data from server
          }, 3000)
        } else {
          setAlertConfig({
            isOpen: true,
            title: "Gagal",
            description: "Gagal melakukan transaksi: " + res.error,
            variant: "destructive"
          })
        }
        
        setIsLoading(false)
      }
    })
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.product.price) * Number(item.quantity)), 0)

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6 h-auto md:h-[calc(100vh-120px)]">
      {/* Left: Product Grid */}
      <div className="w-full md:w-2/3 flex flex-col h-[65vh] md:h-full bg-white/50 backdrop-blur-xl border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-white/80 sticky top-0 z-10 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Daftar Produk</h3>
            <Button variant="outline" size="sm" onClick={() => setIsCustomModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Tambah Manual
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama produk atau SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>
        <div className="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md bg-white max-h-36"
            >
              <div className="text-xs text-muted-foreground mb-1 font-mono">{product.sku}</div>
              <div className="font-semibold text-sm mb-2 line-clamp-2 h-10">{product.name}</div>
              <div className="mt-auto flex items-end justify-between">
                <div className="text-primary font-bold">Rp {Number(product.price).toLocaleString('id-ID')}</div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-50" />
              <span>Tidak ada produk yang sesuai.</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-1/3 flex flex-col h-auto md:h-full bg-white/80 backdrop-blur-xl border rounded-2xl shadow-lg overflow-hidden relative">
        <div className="p-5 border-b bg-gradient-to-r from-gray-50 to-white">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Keranjang
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
              <ShoppingCart className="h-12 w-12 mb-3 text-gray-300" />
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex flex-col gap-2 p-3 border rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-sm pr-2 leading-tight">{item.product.name}</div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-primary font-medium text-sm">
                    Rp {(Number(item.product.price) * (typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity)).toLocaleString('id-ID')}
                  </div>
                  {item.product.category?.name?.toLowerCase().includes("mesh") ? (
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      value={item.quantity}
                      onChange={e => setQuantityDirect(item.product.id, e.target.value)}
                      className="w-24 h-8 text-center px-2 py-1 text-sm bg-gray-50 border-gray-200"
                    />
                  ) : (
                    <div className="flex items-center gap-2 bg-gray-50 border rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={Number(item.quantity) <= 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-5 bg-gray-50 border-t flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pembeli (Opsional)</label>
              <Input 
                placeholder="Misal: Budi"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan (Opsional)</label>
              <Input 
                placeholder="Misal: Utang"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kasir</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg hover:border-primary focus:ring-primary focus:border-primary flex items-center justify-between p-2.5 shadow-sm transition-colors">
                {selectedUserId 
                  ? users.find(u => u.id === selectedUserId)?.username || "Pilih Kasir"
                  : "Pilih Kasir"
                }
                <ChevronDown className="h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                {users.map(u => (
                  <DropdownMenuItem key={u.id} onClick={() => setSelectedUserId(u.id)} className="cursor-pointer">
                    {u.username}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 font-medium">Total Tagihan</span>
            <span className="text-2xl font-bold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>

          <Button 
            onClick={handleCheckout} 
            disabled={cart.length === 0 || isLoading}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl shadow-md transition-all duration-200"
          >
            {isLoading ? "Memproses..." : "Simpan Transaksi"}
          </Button>
        </div>

        {/* Success Overlay */}
        {success && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaksi Berhasil!</h3>
            <p className="text-gray-500">Data penjualan telah disimpan ke dalam sistem.</p>
          </div>
        )}
      </div>

      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Item Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Produk / Item</Label>
              <Input 
                value={customName} 
                onChange={e => setCustomName(e.target.value)} 
                placeholder="Misal: Biaya Layanan" 
              />
            </div>
            <div className="space-y-2">
              <Label>Harga (Rp)</Label>
              <Input 
                type="number" 
                value={customPrice} 
                onChange={e => setCustomPrice(e.target.value)} 
                placeholder="0" 
              />
            </div>
            <div className="space-y-2">
              <Label>Jumlah</Label>
              <Input 
                type="number" 
                min="1"
                value={customQuantity} 
                onChange={e => setCustomQuantity(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomModalOpen(false)}>Batal</Button>
            <Button onClick={addCustomToCart} disabled={!customName || !customPrice || !customQuantity}>Tambah ke Keranjang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        description={alertConfig.description}
        variant={alertConfig.variant}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.onConfirm ? "Ya, Proses" : "OK"}
        cancelText="Batal"
      />
    </div>
  )
}
