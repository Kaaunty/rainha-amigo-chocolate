-- ============================================
-- Migração: Ajustar isDrawn para considerar TODOS os participantes
-- O status "Realizado" agora só aparece quando TODOS os participantes têm match
-- ============================================

-- Atualizar função get_draw_status para considerar isDrawn apenas quando TODOS têm match
CREATE OR REPLACE FUNCTION get_draw_status()
RETURNS JSON AS $$
DECLARE
  total_count INTEGER;
  unmatched_count INTEGER;
  min_participants INTEGER;
  is_drawn BOOLEAN;
  can_draw BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO total_count FROM participants;
  SELECT COUNT(*) INTO unmatched_count FROM participants WHERE matched_with IS NULL;
  SELECT value::INTEGER INTO min_participants FROM config WHERE key = 'min_participants';
  
  -- Sorteio é considerado realizado apenas se TODOS os participantes têm match e há pelo menos 2 participantes
  is_drawn := unmatched_count = 0 AND total_count >= 2;
  
  -- Pode fazer sorteio se houver pelo menos 2 participantes sem match e atender o mínimo configurado
  can_draw := unmatched_count >= 2 AND unmatched_count >= min_participants;
  
  RETURN json_build_object(
    'isDrawn', is_drawn,
    'totalParticipants', total_count,
    'unmatchedParticipants', unmatched_count,
    'minParticipants', min_participants,
    'canDraw', can_draw
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RESUMO DA ALTERAÇÃO:
-- ============================================
-- ANTES:
--   is_drawn := EXISTS(SELECT 1 FROM participants WHERE matched_with IS NOT NULL);
--   (Retornava true se ALGUM participante tivesse match)
--
-- AGORA:
--   is_drawn := unmatched_count = 0 AND total_count >= 2;
--   (Retorna true apenas se TODOS os participantes têm match E há pelo menos 2 participantes)
--
-- ============================================
-- IMPACTO:
-- ============================================
-- - Tela Admin: Status "Realizado" só aparece quando TODOS têm match
-- - Botão "Enviar Emails" só aparece quando TODOS têm match
-- - Permite sorteios incrementais: pode fazer novo sorteio mesmo se alguns já tiverem match
-- - Quando alguns têm match mas outros não, o status continua como "Pendente"
--
-- ============================================
-- COMO APLICAR:
-- ============================================
-- Execute este arquivo no SQL Editor do Supabase
-- A função será atualizada automaticamente
--
-- ============================================

