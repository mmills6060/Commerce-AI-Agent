import Image from "next/image"
import { notFound } from "next/navigation"
import { getProduct } from "@/lib/mock-data"
import { ShoppingCart } from "lucide-react"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.currency,
            }).format(product.price)}
          </p>
          <p className="mt-6 text-muted-foreground leading-7">
            {product.description}
          </p>
          {product.category && (
            <p className="mt-4 text-sm text-muted-foreground">
              Category: <span className="font-medium">{product.category}</span>
            </p>
          )}
          <div className="mt-8 flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <button className="rounded-md border border-input bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              Buy Now
            </button>
          </div>
          {product.inStock === false && (
            <p className="mt-4 text-sm text-destructive">Out of stock</p>
          )}
        </div>
      </div>
    </div>
  )
}

