import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { withLoading } from '../lib/loading'

export interface Friend {
  id: string
  friendUid: string
  friendName: string
  friendAvatarUrl: string
  createdAt: string
}

const friends = ref<Friend[]>([])

function toFriend(row: Record<string, unknown>, avatarMap: Record<string, string> = {}): Friend {
  return {
    id:              row.id          as string,
    friendUid:       row.friend_uid  as string,
    friendName:      row.friend_name as string,
    friendAvatarUrl: avatarMap[row.friend_uid as string] ?? '',
    createdAt:       row.created_at  as string,
  }
}

export function useFriends() {
  async function load() {
    await withLoading(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const { data } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      const uids = (data ?? []).map((r) => r.friend_uid as string)
      const avatarMap: Record<string, string> = {}
      if (uids.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .in('id', uids)
        ;(profiles ?? []).forEach((p) => {
          avatarMap[p.id as string] = (p.avatar_url as string) ?? ''
        })
      }
      friends.value = (data ?? []).map((r) => toFriend(r, avatarMap))
    })
  }

  async function add(friendUid: string, friendName: string) {
    await withLoading(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const { data: row, error } = await supabase
        .from('friends')
        .insert({ user_id: session.user.id, friend_uid: friendUid, friend_name: friendName })
        .select()
        .single()
      if (!error && row) friends.value.unshift(toFriend(row))
    })
  }

  async function remove(id: string) {
    friends.value = friends.value.filter(f => f.id !== id)
    await withLoading(async () => {
      await supabase.from('friends').delete().eq('id', id)
    })
  }

  function parseUid(input: string): string | null {
    const trimmed = input.trim()
    try {
      const uid = new URL(trimmed).searchParams.get('uid')
      if (uid) return uid
    } catch {}
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRe.test(trimmed) ? trimmed : null
  }

  return { friends, load, add, remove, parseUid }
}
