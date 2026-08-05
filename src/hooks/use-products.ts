import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, code, name, brand, model, size, category, asking_price, year, condition, photos, raio_x, accessories, quantity, eval_type, eval_date')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    refetchInterval: 30000,
  })
}
