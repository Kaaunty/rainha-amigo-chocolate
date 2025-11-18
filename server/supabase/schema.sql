-- ============================================
-- Schema do Banco de Dados - Amigo Chocolate
-- Rainha das Sete
-- ============================================

-- Tabela de participantes
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  matched_with UUID REFERENCES participants(id),
  preferred_chocolate TEXT,
  dislikes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de admin (para autenticação)
CREATE TABLE IF NOT EXISTS admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO config (key, value) 
VALUES ('min_participants', '5')
ON CONFLICT (key) DO NOTHING;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_participants_token ON participants(token);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_matched_with ON participants(matched_with);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_participants_updated_at ON participants;
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_config_updated_at ON config;
CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_unique_token()
RETURNS TEXT AS $$
DECLARE
  new_token TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Gera um token aleatório de 32 caracteres
    new_token := encode(gen_random_bytes(16), 'hex');
    
    -- Verifica se já existe
    SELECT EXISTS(SELECT 1 FROM participants WHERE participants.token = new_token) INTO exists_check;
    
    -- Se não existe, retorna o token
    IF NOT exists_check THEN
      RETURN new_token;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para realizar o sorteio
CREATE OR REPLACE FUNCTION perform_draw()
RETURNS JSON AS $$
DECLARE
  participant_record RECORD;
  matched_record RECORD;
  available_ids UUID[];
  random_id UUID;
  result JSON;
  pairs JSON[] := '{}';
BEGIN
  -- Verifica se já foi sorteado
  IF EXISTS (SELECT 1 FROM participants WHERE matched_with IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'message', 'Sorteio já foi realizado');
  END IF;

  -- Verifica número mínimo
  IF (SELECT COUNT(*) FROM participants) < 
     (SELECT value::INTEGER FROM config WHERE key = 'min_participants') THEN
    RETURN json_build_object('success', false, 'message', 'Número mínimo de participantes não atingido');
  END IF;

  -- Cria array de IDs disponíveis
  SELECT ARRAY_AGG(id) INTO available_ids FROM participants;

  -- Para cada participante, sorteia um amigo
  FOR participant_record IN SELECT * FROM participants ORDER BY RANDOM() LOOP
    -- Remove o próprio ID do array disponível
    available_ids := array_remove(available_ids, participant_record.id);
    
    -- Se não há mais participantes disponíveis, reinicia
    IF array_length(available_ids, 1) IS NULL THEN
      SELECT ARRAY_AGG(id) INTO available_ids FROM participants WHERE id != participant_record.id;
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

-- Função para resetar o sorteio
CREATE OR REPLACE FUNCTION reset_draw()
RETURNS JSON AS $$
BEGIN
  UPDATE participants SET matched_with = NULL WHERE matched_with IS NOT NULL;
  RETURN json_build_object('success', true, 'message', 'Sorteio resetado com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter status do sorteio
CREATE OR REPLACE FUNCTION get_draw_status()
RETURNS JSON AS $$
DECLARE
  total_count INTEGER;
  min_participants INTEGER;
  is_drawn BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO total_count FROM participants;
  SELECT value::INTEGER INTO min_participants FROM config WHERE key = 'min_participants';
  SELECT EXISTS(SELECT 1 FROM participants WHERE matched_with IS NOT NULL) INTO is_drawn;
  
  RETURN json_build_object(
    'isDrawn', is_drawn,
    'totalParticipants', total_count,
    'minParticipants', min_participants,
    'canDraw', total_count >= min_participants
  );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar senha do admin
-- Nota: Esta função requer que você use crypt() do PostgreSQL
-- Para criar admin: INSERT INTO admin (password_hash) VALUES (crypt('senha', gen_salt('bf')));
CREATE OR REPLACE FUNCTION verify_admin_password(password_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Buscar hash armazenado
  SELECT password_hash INTO stored_hash
  FROM admin
  LIMIT 1;
  
  -- Se não encontrou admin, retorna false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Comparar senha usando crypt (requer extensão pgcrypto)
  RETURN crypt(password_input, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar número mínimo de participantes
CREATE OR REPLACE FUNCTION update_min_participants(min_participants_value INTEGER)
RETURNS JSON AS $$
DECLARE
  updated_rows INTEGER;
BEGIN
  -- Validar valor mínimo
  IF min_participants_value < 2 THEN
    RETURN json_build_object('success', false, 'message', 'Número mínimo deve ser pelo menos 2');
  END IF;
  
  -- Tentar atualizar primeiro
  UPDATE config
  SET value = min_participants_value::TEXT,
      updated_at = NOW()
  WHERE key = 'min_participants';
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  -- Se não atualizou nenhuma linha, inserir
  IF updated_rows = 0 THEN
    INSERT INTO config (key, value, updated_at)
    VALUES ('min_participants', min_participants_value::TEXT, NOW());
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Configuração atualizada com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

