import { ref, readonly } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const user = ref<User | null>(null)
const loading = ref(true)
const username = ref('')

async function loadUsername(uid: string) {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', uid)
    .single()
  username.value = (data?.username as string) ?? ''
}

// onAuthStateChange fires INITIAL_SESSION on subscribe — no need for a separate getSession() call.
// Ignoring TOKEN_REFRESHED avoids re-running loadUsername and triggering App.vue watch on every token refresh.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    user.value = session?.user ?? null
    return
  }
  user.value = session?.user ?? null
  if (user.value) loadUsername(user.value.id)
  else username.value = ''
  loading.value = false
})

export function useAuth() {
  async function signIn(email: string, password: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return true
  }

  async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: name } },
    })
    if (error) throw error
  }

  async function fetchUsername(uid: string): Promise<string> {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', uid)
      .single()
    return (data?.username as string) ?? ''
  }

  async function fetchRecentProfiles(
    excludeUid: string,
    excludeUids: string[],
  ): Promise<Array<{ id: string; username: string }>> {
    const { data } = await supabase
      .from('profiles')
      .select('id, username')
      .neq('id', excludeUid)
      .order('created_at', { ascending: false })
      .limit(20)
    return (data ?? [])
      .filter((u) => u.username && !excludeUids.includes(u.id as string))
      .slice(0, 5)
      .map((u) => ({ id: u.id as string, username: u.username as string }))
  }

  async function updateUsername(name: string) {
    if (!user.value) return
    await supabase.from('profiles').update({ username: name }).eq('id', user.value.id)
    username.value = name
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    username: readonly(username),
    signIn,
    signUp,
    signOut,
    fetchUsername,
    fetchRecentProfiles,
    updateUsername,
    updatePassword,
  }
}
