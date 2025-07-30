'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Package, 
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchProducts, deleteProduct } from './actions'
import SimpleProductForm from './SimpleProductForm'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import 'remixicon/fonts/remixicon.css'

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  brand?: string
  image_url: string
  images?: Array<{ url: string; public_id: string }>
  stock_quantity: number
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    product: Product | null
    isDeleting: boolean
  }>({
    open: false,
    product: null,
    isDeleting: false
  })
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProducts()
      setProducts(Array.isArray(data) ? data : [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Products fetch error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      setProducts([])
      toast.error('Failed to load products', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDeleteProduct = async (id: number) => {
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }))
    
    try {
      await deleteProduct(id)
      toast.success('Product deleted successfully', {
        description: `"${deleteDialog.product?.name}" has been removed from your catalog.`
      })
      await loadProducts() // Refresh the list
    } catch (err) {
      console.error('Delete error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      toast.error('Failed to delete product', {
        description: errorMessage
      })
      setError(errorMessage)
    } finally {
      setDeleteDialog({
        open: false,
        product: null,
        isDeleting: false
      })
    }
  }

  const openDeleteDialog = (product: Product) => {
    console.log('Opening delete dialog for product:', product.name)
    setDeleteDialog({
      open: true,
      product,
      isDeleting: false
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      product: null,
      isDeleting: false
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleFormSuccess = (isEditing: boolean) => {
    setShowForm(false)
    setEditingProduct(null)
    loadProducts() // Refresh after form closes
    
    // Show appropriate success toast
    if (isEditing) {
      toast.success('Product updated successfully', {
        description: 'Your product changes have been saved.'
      })
    } else {
      toast.success('Product created successfully', {
        description: 'Your new product has been added to the catalog.'
      })
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    loadProducts() // Refresh after form closes
  }

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (showForm) {
    return (
      <SimpleProductForm
        product={editingProduct}
        onSuccess={() => handleFormSuccess(!!editingProduct)}
        onCancel={handleCloseForm}
      />
    )
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600 flex items-center">
            <i className="ri-store-line mr-2"></i>
            Manage your product catalog
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 text-gray-700 rounded-xl hover:bg-white disabled:opacity-50 transition-all duration-200 shadow-sm border border-white/20 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                  <i className="ri-package-line text-xl text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600">
                  <i className="ri-check-line text-xl text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.is_active).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                  <i className="ri-function-line text-xl text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600">
                  <i className="ri-money-dollar-circle-line text-xl text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length > 0 
                      ? formatCurrency(products.reduce((sum, p) => sum + p.price, 0) / products.length)
                      : '$0.00'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {lastUpdated && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <i className="ri-time-line"></i>
                <span>Last updated: {formatTime(lastUpdated)}</span>
              </div>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || filterCategory ? 'Try adjusting your search criteria to find what you\'re looking for' : 'Get started by adding your first product to the catalog'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 transform hover:-translate-y-1">
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                  {product.image_url && !imageErrors.has(product.id) ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={() => {
                        setImageErrors(prev => new Set(prev).add(product.id))
                      }}
                    />
                  ) : (
                    <div className="w-full h-full p-4">
                      <Skeleton className="w-full h-full" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {product.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shadow-sm">
                        <i className="ri-check-line mr-1"></i>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 shadow-sm">
                        <i className="ri-close-line mr-1"></i>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2 truncate text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{product.category}</span>
                    <span className="flex items-center">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => openDeleteDialog(product)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={closeDeleteDialog}
          onConfirm={() => deleteDialog.product && handleDeleteProduct(deleteDialog.product.id)}
          title="Delete Product"
          itemName={deleteDialog.product?.name}
          description={`Are you sure you want to delete "${deleteDialog.product?.name}"? This will permanently remove it from your catalog and cannot be undone.`}
          isLoading={deleteDialog.isDeleting}
        />
      </div>
    )
  }
