
-- ==============================================================================
-- PATCH DE ATUALIZAÇÃO ESTRUTURAL (MIGRAÇÃO)
-- Rode este script para atualizar tabelas já criadas que não têm as novas colunas.
-- ==============================================================================

DO $$
BEGIN
    -- 1. ATUALIZAÇÃO DA TABELA FUNCIONARIOS
    -- Adiciona colunas de Lotação e RH se não existirem
    
    -- Tipo de Lotação (Definitiva, Provisória, etc)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='tipo_lotacao') THEN
        ALTER TABLE public.funcionarios ADD COLUMN tipo_lotacao TEXT;
    END IF;

    -- Turno (Manhã, Tarde, etc)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='turno') THEN
        ALTER TABLE public.funcionarios ADD COLUMN turno TEXT;
    END IF;

    -- Carga Horária
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='carga_horaria') THEN
        ALTER TABLE public.funcionarios ADD COLUMN carga_horaria NUMERIC;
    END IF;

    -- Controle de Dobra (Dupla regência)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='possui_dobra') THEN
        ALTER TABLE public.funcionarios ADD COLUMN possui_dobra BOOLEAN DEFAULT false;
    END IF;
    
    -- Controle Diário de Presença
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='presenca_confirmada') THEN
        ALTER TABLE public.funcionarios ADD COLUMN presenca_confirmada BOOLEAN DEFAULT false;
    END IF;

    -- Foto do Funcionário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='foto_url') THEN
        ALTER TABLE public.funcionarios ADD COLUMN foto_url TEXT;
    END IF;
    
    -- Escola ID (Garantia)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funcionarios' AND column_name='escola_id') THEN
        ALTER TABLE public.funcionarios ADD COLUMN escola_id UUID;
    END IF;

    -- 2. ATUALIZAÇÃO DA TABELA ESCOLAS
    -- Garante campos de acesso do gestor
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='escolas' AND column_name='codigo_gestor') THEN
        ALTER TABLE public.escolas ADD COLUMN codigo_gestor TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='escolas' AND column_name='codigo_acesso') THEN
        ALTER TABLE public.escolas ADD COLUMN codigo_acesso TEXT;
    END IF;

END $$;

-- 3. CRIAÇÃO DE TABELAS NOVAS (Se ainda não existirem)
CREATE TABLE IF NOT EXISTS public.historico_lotacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funcionario_id UUID,
    escola_anterior_id UUID,
    escola_nova_id UUID,
    dono_id UUID,
    motivo TEXT,
    data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CONFIGURAÇÃO DE STORAGE (FOTOS)
-- Tenta criar o bucket 'fotos' e deixá-lo público para evitar erros de upload
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove policies antigas para recriar permissivas (já que RLS está disable nas tabelas, mas Storage precisa de config)
DROP POLICY IF EXISTS "Fotos Publicas Select" ON storage.objects;
DROP POLICY IF EXISTS "Fotos Publicas Insert" ON storage.objects;
DROP POLICY IF EXISTS "Fotos Publicas Update" ON storage.objects;

CREATE POLICY "Fotos Publicas Select" ON storage.objects FOR SELECT USING ( bucket_id = 'fotos' );
CREATE POLICY "Fotos Publicas Insert" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'fotos' );
CREATE POLICY "Fotos Publicas Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'fotos' );

-- 5. REFORÇO DE SEGURANÇA (DESATIVAR RLS)
ALTER TABLE public.setores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_lotacao DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis DISABLE ROW LEVEL SECURITY;
