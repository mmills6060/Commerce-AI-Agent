import { ProductCard } from "@/components/product-card"
import { fetchProducts } from "@/lib/api"

interface SearchPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export const dynamic = 'force-dynamic'

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const category = params.category
  const query = params.q

  const products = await fetchProducts()
  let filteredProducts = products

  if (category) {
    filteredProducts = products.filter(
      (product) => product.category?.toLowerCase() === category.toLowerCase()
    )
  }

  if (query) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : "Search Results"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
        </p>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  )
}

