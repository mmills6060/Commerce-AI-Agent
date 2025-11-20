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
          items: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          total: number
          currency?: string
          status?: string
          items: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          total?: number
          currency?: string
          status?: string
          items?: any
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          messages: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          messages: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          messages?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

