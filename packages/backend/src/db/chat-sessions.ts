import { supabase } from '../lib/supabase.js'

export interface ChatSession {
  id: string
  userId?: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

interface SupabaseChatSession {
  id: string
  user_id: string | null
  messages: any
  created_at: string
  updated_at: string
}

function mapToChatSession(dbSession: SupabaseChatSession): ChatSession {
  return {
    id: dbSession.id,
    userId: dbSession.user_id || undefined,
    messages: dbSession.messages,
    createdAt: dbSession.created_at,
    updatedAt: dbSession.updated_at
  }
}

export async function createChatSession(userId?: string, initialMessages: ChatMessage[] = []): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId || null,
      messages: initialMessages
    } as any)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create chat session: ${error.message}`)
  }

  return mapToChatSession(data)
}

export async function getChatSessionById(id: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch chat session: ${error.message}`)
  }

  return data ? mapToChatSession(data) : null
}

export async function getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch chat sessions: ${error.message}`)
  }

  return (data || []).map(mapToChatSession)
}

export async function updateChatSession(id: string, messages: ChatMessage[]): Promise<ChatSession | null> {
  const { data, error } = await (supabase
    .from('chat_sessions') as any)
    .update({ messages })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to update chat session: ${error.message}`)
  }

  return data ? mapToChatSession(data) : null
}

export async function deleteChatSession(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete chat session: ${error.message}`)
  }

  return true
}

