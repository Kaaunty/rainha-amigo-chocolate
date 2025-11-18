-- ============================================
-- Migração: Adicionar campos de preferências
-- Adiciona campos preferred_chocolate e dislikes na tabela participants
-- ============================================

-- Adicionar campo preferred_chocolate se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' 
    AND column_name = 'preferred_chocolate'
  ) THEN
    ALTER TABLE participants ADD COLUMN preferred_chocolate TEXT;
  END IF;
END $$;

-- Adicionar campo dislikes se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'participants' 
    AND column_name = 'dislikes'
  ) THEN
    ALTER TABLE participants ADD COLUMN dislikes TEXT;
  END IF;
END $$;

