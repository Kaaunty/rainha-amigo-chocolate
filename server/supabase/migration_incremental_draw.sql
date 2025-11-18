-- ============================================
-- Migração: Permitir Sorteios Incrementais
-- Permite que novos sorteios aconteçam mesmo se alguns participantes já tiverem match
-- O sorteio acontece apenas entre participantes sem match (matched_with IS NULL)
-- ============================================

-- Atualizar função perform_draw para permitir sorteios incrementais
CREATE OR REPLACE FUNCTION perform_draw()
RETURNS JSON AS $$
DECLARE
  participant_record RECORD;
  matched_record RECORD;
  available_ids UUID[];
  random_id UUID;
  result JSON;
  pairs JSON[] := '{}';
  unmatched_count INTEGER;
BEGIN
  -- Conta participantes sem match
  SELECT COUNT(*) INTO unmatched_count 
  FROM participants 
  WHERE matched_with IS NULL;

  -- Verifica se há pelo menos 2 participantes sem match
  IF unmatched_count < 2 THEN
    RETURN json_build_object('success', false, 'message', 'É necessário pelo menos 2 participantes sem match para realizar o sorteio');
  END IF;

  -- Verifica número mínimo (considerando apenas participantes sem match)
  IF unmatched_count < 
     (SELECT value::INTEGER FROM config WHERE key = 'min_participants') THEN
    RETURN json_build_object('success', false, 'message', 'Número mínimo de participantes sem match não atingido');
  END IF;

  -- Cria array de IDs disponíveis (apenas participantes sem match)
  SELECT ARRAY_AGG(id) INTO available_ids 
  FROM participants 
  WHERE matched_with IS NULL;

  -- Para cada participante sem match, sorteia um amigo
  FOR participant_record IN 
    SELECT * FROM participants 
    WHERE matched_with IS NULL 
    ORDER BY RANDOM() 
  LOOP
    -- Remove o próprio ID do array disponível
    available_ids := array_remove(available_ids, participant_record.id);
    
    -- Se não há mais participantes disponíveis, reinicia
    IF array_length(available_ids, 1) IS NULL THEN
      SELECT ARRAY_AGG(id) INTO available_ids 
      FROM participants 
      WHERE matched_with IS NULL 
      AND id != participant_record.id;
    END IF;
    
    -- Seleciona um ID aleatório dos disponíveis
    random_id := available_ids[1 + floor(random() * array_length(available_ids, 1))::int];
    
    -- Remove o ID selecionado do array
    available_ids := array_remove(available_ids, random_id);
    
    -- Atualiza o participante com o amigo sorteado
    UPDATE participants 
    SET matched_with = random_id 
    WHERE id = participant_record.id;
    
    -- Adiciona ao resultado
    SELECT json_build_object(
      'participant_id', participant_record.id,
      'participant_name', participant_record.name,
      'matched_id', random_id,
      'matched_name', (SELECT name FROM participants WHERE id = random_id)
    ) INTO matched_record;
    
    pairs := array_append(pairs, matched_record::json);
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'message', 'Sorteio realizado com sucesso',
    'pairs', pairs
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função get_draw_status para considerar participantes sem match
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
  SELECT EXISTS(SELECT 1 FROM participants WHERE matched_with IS NOT NULL) INTO is_drawn;
  
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
-- RESUMO DAS ALTERAÇÕES:
-- ============================================
-- 1. Função perform_draw():
--    - Removida verificação que impedia sorteio se já existisse algum match
--    - Agora considera apenas participantes sem match (matched_with IS NULL)
--    - Verifica se há pelo menos 2 participantes sem match
--    - Verifica número mínimo considerando apenas participantes sem match
--
-- 2. Função get_draw_status():
--    - Agora retorna 'unmatchedParticipants' (número de participantes sem match)
--    - 'canDraw' considera apenas participantes sem match
--    - Permite que novos sorteios sejam feitos mesmo se alguns participantes já tiverem match
--
-- ============================================
-- COMO APLICAR:
-- ============================================
-- Execute este arquivo no SQL Editor do Supabase
-- As funções serão atualizadas automaticamente
--
-- Após executar, o sistema permitirá:
-- - Fazer novos sorteios mesmo se alguns participantes já tiverem match
-- - O sorteio acontecerá apenas entre participantes sem match
-- - Participantes que já têm match não serão sorteados novamente
-- ============================================

