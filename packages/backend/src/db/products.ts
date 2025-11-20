import { supabase } from '../lib/supabase.js'
import type { Product } from '../types/product.js'
import type { Database } from '../types/supabase.js'

interface SupabaseProduct {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image: string | null
  images: string[] | null
  category: string | null
  in_stock: boolean
  created_at: string
  updated_at: string
}

function mapToProduct(dbProduct: SupabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: dbProduct.price,
    currency: dbProduct.currency,
    image: dbProduct.image || '',
    images: dbProduct.images || [],
    category: dbProduct.category || 'Uncategorized',
    inStock: dbProduct.in_stock
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return (data || []).map(mapToProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch product: ${error.message}`)
  }

  return data ? mapToProduct(data) : null
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .insert({
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      image: product.image,
      images: product.images,
      category: product.category,
      in_stock: product.inStock
    } as Database['public']['Tables']['products']['Insert'])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }

  return mapToProduct(data)
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const dbUpdates: Database['public']['Tables']['products']['Update'] = {}
  
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.price !== undefined) dbUpdates.price = updates.price
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency
  if (updates.image !== undefined) dbUpdates.image = updates.image
  if (updates.images !== undefined) dbUpdates.images = updates.images
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('products') as any)
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to update product: ${error.message}`)
  }

  return data ? mapToProduct(data) : null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`)
  }

  return true
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to search products: ${error.message}`)
  }

  return (data || []).map(mapToProduct)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch products by category: ${error.message}`)
  }

  return (data || []).map(mapToProduct)
}

