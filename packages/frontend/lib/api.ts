import { Product } from "./types"

// Use server-side env var for SSR, fallback to NEXT_PUBLIC for client-side
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function fetchProducts(): Promise<Product[]> {
  try {
    const url = `${API_BASE_URL}/products`
    console.log('[fetchProducts] Attempting to fetch from:', API_BASE_URL ? `${API_BASE_URL}/products` : 'URL not configured')
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      console.error(`[fetchProducts] HTTP ${response.status}:`, errorText)
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      console.error('[fetchProducts] Error:', error.message)
      // Log the actual URL being used (helpful for debugging)
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchProducts] API URL:', API_BASE_URL)
      }
    } else {
      console.error('[fetchProducts] Unknown error:', error)
    }
    throw error
  }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      cache: 'no-store'
    })
    
    if (response.status === 404) {
      return null
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }
}

