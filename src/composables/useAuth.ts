import { ref, readonly } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const user = ref<User | null>(null)
const loading = ref(true)

supabase.auth.getSession().then(({ data }) => {
  user.value = data.session?.user ?? null
  loading.value = false
})

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null
  loading.value = false
})

export function useAuth() {
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn,
    signUp,
    signOut,
  }
}
