import { tool } from 'langchain'
import { z } from 'zod'
import { supabase } from '../../lib/supabase.js'

const searchProductsSchema = z.object({
  searchTerm: z.string().optional().describe('Search term to find in product names or descriptions'),
  category: z.string().optional().describe('Filter by product category'),
  minPrice: z.number().optional().describe('Minimum price filter'),
  maxPrice: z.number().optional().describe('Maximum price filter'),
  inStock: z.boolean().optional().describe('Filter by stock availability'),
  limit: z.number().optional().default(10).describe('Maximum number of results to return')
})

export const searchProducts = tool(
  async ({ searchTerm, category, minPrice, maxPrice, inStock, limit }: z.infer<typeof searchProductsSchema>) => {
    try {
      
      let query = supabase.from('products').select('*')
      
      // Apply search term filter (searches in name and description)
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }
      
      // Apply category filter
      if (category) {
        query = query.eq('category', category)
      }
      
      // Apply price range filters
      if (minPrice !== undefined) {
        query = query.gte('price', minPrice)
      }
      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice)
      }
      
      // Apply stock filter
      if (inStock !== undefined) {
        query = query.eq('in_stock', inStock)
      }
      
      // Apply limit
      query = query.limit(limit)
      
      const { data, error } = await query
      
      if (error) {
        return `Error searching products: ${error.message}`
      }
      
      if (!data || data.length === 0) {
        return 'No products found matching your criteria.'
      }
      
      interface ProductRow {
        id: string
        name: string
        currency: string
        price: number
        category: string | null
        in_stock: boolean
        description: string | null
      }

      // Format the results
      const formattedResults = data.map((product: ProductRow) => ({
        id: product.id,
        name: product.name,
        price: `${product.currency}${product.price}`,
        category: product.category || 'Uncategorized',
        inStock: product.in_stock,
        description: product.description ? product.description.substring(0, 100) + '...' : 'No description'
      }))
      
      return JSON.stringify(formattedResults, null, 2)
    } catch (error) {
      return `Unexpected error while searching: ${error}`
    }
  },
  {
    name: 'search_products',
    description: 'Search for products in the database by various criteria',
    schema: searchProductsSchema
  }
)

const searchOrdersSchema = z.object({
  userId: z.string().optional().describe('User ID to filter orders'),
  status: z.string().optional().describe('Order status to filter by'),
  minTotal: z.number().optional().describe('Minimum order total'),
  maxTotal: z.number().optional().describe('Maximum order total'),
  limit: z.number().optional().default(10).describe('Maximum number of results to return')
})

export const searchOrders = tool(
  async ({ userId, status, minTotal, maxTotal, limit }: z.infer<typeof searchOrdersSchema>) => {
    try {
      
      let query = supabase.from('orders').select('*')
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      if (status) {
        query = query.eq('status', status)
      }
      
      if (minTotal !== undefined) {
        query = query.gte('total', minTotal)
      }
      
      if (maxTotal !== undefined) {
        query = query.lte('total', maxTotal)
      }
      
      query = query.limit(limit).order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) {
        return `Error searching orders: ${error.message}`
      }
      
      if (!data || data.length === 0) {
        return 'No orders found matching your criteria.'
      }
      
      interface OrderRow {
        id: string
        user_id: string | null
        currency: string
        total: number
        status: string
        items: unknown[]
        created_at: string
      }

      const formattedResults = data.map((order: OrderRow) => ({
        id: order.id,
        userId: order.user_id,
        total: `${order.currency}${order.total}`,
        status: order.status,
        itemCount: Array.isArray(order.items) ? order.items.length : 0,
        createdAt: new Date(order.created_at).toLocaleString()
      }))
      
      return JSON.stringify(formattedResults, null, 2)
    } catch (error) {
      return `Unexpected error while searching: ${error}`
    }
  },
  {
    name: 'search_orders',
    description: 'Search for orders in the database by various criteria',
    schema: searchOrdersSchema
  }
)

const getProductDetailsSchema = z.object({
  productId: z.string().describe('The ID of the product to retrieve')
})

export const getProductDetails = tool(
  async ({ productId }: z.infer<typeof getProductDetailsSchema>) => {
    try {
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      
      if (error) {
        return `Error fetching product: ${error.message}`
      }
      
      if (!data) {
        return 'Product not found.'
      }
      
      interface ProductRow {
        id: string
        name: string
        description: string | null
        currency: string
        price: number
        category: string | null
        in_stock: boolean
        images: string[] | null
        image: string | null
        created_at: string
        updated_at: string
      }

      const product = data as ProductRow
      
      return JSON.stringify({
        id: product.id,
        name: product.name,
        description: product.description,
        price: `${product.currency}${product.price}`,
        category: product.category || 'Uncategorized',
        inStock: product.in_stock,
        images: product.images || [product.image].filter(Boolean),
        createdAt: new Date(product.created_at).toLocaleString(),
        updatedAt: new Date(product.updated_at).toLocaleString()
      }, null, 2)
    } catch (error) {
      return `Unexpected error: ${error}`
    }
  },
  {
    name: 'get_product_details',
    description: 'Get detailed information about a specific product by ID',
    schema: getProductDetailsSchema
  }
)
