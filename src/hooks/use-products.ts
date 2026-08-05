import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, code, name, category, asking_price, year, condition, photos, notes, accessories')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    refetchInterval: 30000,
  })
}
