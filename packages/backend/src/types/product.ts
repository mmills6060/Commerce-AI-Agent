export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  images?: string[]
  category?: string
  inStock?: boolean
}

