import { supabase } from '../lib/supabase.js'

export interface Order {
  id: string
  userId?: string
  total: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface SupabaseOrder {
  id: string
  user_id: string | null
  total: number
  currency: string
  status: string
  items: any
  created_at: string
  updated_at: string
}

function mapToOrder(dbOrder: SupabaseOrder): Order {
  return {
    id: dbOrder.id,
    userId: dbOrder.user_id || undefined,
    total: dbOrder.total,
    currency: dbOrder.currency,
    status: dbOrder.status as Order['status'],
    items: dbOrder.items,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: order.userId || null,
      total: order.total,
      currency: order.currency,
      status: order.status,
      items: order.items
    } as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return mapToOrder(data)
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  return data ? mapToOrder(data) : null
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return (data || []).map(mapToOrder)
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const { data, error } = await (supabase
    .from('orders') as any)
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to update order status: ${error.message}`)
  }

  return data ? mapToOrder(data) : null
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch all orders: ${error.message}`)
  }

  return (data || []).map(mapToOrder)
}

