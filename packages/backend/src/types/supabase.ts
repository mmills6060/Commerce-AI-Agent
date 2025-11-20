// Define types locally to avoid circular dependencies
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          image?: string | null
          images?: string[] | null
          category?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          image?: string | null
          images?: string[] | null
          category?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total: number
          currency: string
          status: string
          items: OrderItem[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          total: number
          currency?: string
          status?: string
          items: OrderItem[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          total?: number
          currency?: string
          status?: string
          items?: OrderItem[]
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          messages: ChatMessage[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          messages: ChatMessage[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          messages?: ChatMessage[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [key: string]: never
    }
    Functions: {
      [key: string]: never
    }
    Enums: {
      [key: string]: never
    }
  }
}

