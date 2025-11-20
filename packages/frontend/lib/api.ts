import { Product } from "./types"

// Use server-side env var for SSR, fallback to NEXT_PUBLIC for client-side
// API_URL should include /api (e.g., https://backend.com/api or http://localhost:3001/api)
const API_BASE_URL = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

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
      let errorMessage = response.statusText
      let errorDetails = ''
      
      try {
        const errorData = await response.json()
        errorDetails = errorData.message || errorData.error || ''
        if (errorDetails) {
          errorMessage = `${response.statusText}: ${errorDetails}`
        }
      } catch {
        // If response is not JSON, try to get text
        const errorText = await response.text().catch(() => '')
        if (errorText) {
          errorDetails = errorText
          errorMessage = `${response.statusText}: ${errorText.substring(0, 200)}`
        }
      }
      
      console.error(`[fetchProducts] HTTP ${response.status}:`, errorMessage)
      if (errorDetails) {
        console.error('[fetchProducts] Error details:', errorDetails)
      }
      
      throw new Error(`Failed to fetch products: ${errorMessage}`)
    }
    
    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      console.error('[fetchProducts] Error:', error.message)
      // Always log the API URL in production for debugging
      console.error('[fetchProducts] API URL:', API_BASE_URL || 'not set')
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

