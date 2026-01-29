
import { supabase } from './base.ts';
import { RhContact } from '../types.ts';

export const rhContactService = {
  getAll: async (donoId: string): Promise<RhContact[]> => {
    const { data, error } = await supabase
      .from('rh_contatos')
      .select('*')
      .eq('dono_id', donoId)
      .order('ordem', { ascending: true })
      .order('nome', { ascending: true });

    if (error) {
      console.warn("Aviso: Falha ao buscar rh_contatos do banco. Usando fallback vazio.", error.message);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      label: d.nome,
      value: d.valor,
      type: d.tipo
    }));
  },

  sync: async (donoId: string, contacts: RhContact[]): Promise<void> => {
    // Para simplificar a lógica e manter minimalismo: deleta todos e reinsere o novo estado
    // Isso garante que remoções feitas na UI sejam refletidas no banco
    const { error: deleteError } = await supabase
      .from('rh_contatos')
      .delete()
      .eq('dono_id', donoId);

    if (deleteError) throw deleteError;

    if (contacts.length === 0) return;

    const payload = contacts.map((c, idx) => ({
      dono_id: donoId,
      nome: c.label,
      valor: c.value,
      tipo: c.type,
      ordem: idx
    }));

    const { error: insertError } = await supabase
      .from('rh_contatos')
      .insert(payload);

    if (insertError) throw insertError;
  }
};
