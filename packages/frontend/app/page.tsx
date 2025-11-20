import { ProductCard } from "@/components/product-card"
import { fetchProducts } from "@/lib/api"

export const dynamic = 'force-dynamic'

export default async function Home() {
  let products
  let error: string | null = null

  try {
    products = await fetchProducts()
  } catch (err) {
    console.error('Failed to load products:', err)
    error = err instanceof Error ? err.message : 'Failed to load products'
    products = []
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Discover our collection of premium products
        </p>
      </div>
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive font-medium">Error loading products</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Please ensure the backend service is running and API_URL environment variable is configured.
          </p>
        </div>
      )}
      {products.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products available</p>
        </div>
      )}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
