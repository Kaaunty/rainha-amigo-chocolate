#!/bin/bash

# Script rápido para fazer deploy da Edge Function send-email

echo "🚀 Iniciando deploy da Edge Function send-email..."
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado!"
    echo "   Instale com: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Verificar se está logado
echo "🔐 Verificando login..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Não está logado. Fazendo login..."
    supabase login
fi

echo "✅ Login verificado"
echo ""

# Linkar ao projeto (se necessário)
echo "🔗 Verificando link com o projeto..."
supabase link --project-ref ebwsbboixpyafrritktv --password "" 2>/dev/null || echo "   Projeto já linkado ou precisa de senha"
echo ""

# Fazer deploy
echo "📦 Fazendo deploy da função send-email..."
supabase functions deploy send-email

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo ""
    echo "📝 Próximos passos:"
    echo "   1. Configure as Secrets no Dashboard do Supabase:"
    echo "      - RESEND_API_KEY"
    echo "      - RESEND_FROM_EMAIL"
    echo "   2. Verifique o arquivo .env com VITE_API_URL"
    echo "   3. Reinicie o servidor de desenvolvimento"
    echo "   4. Teste no painel admin"
else
    echo ""
    echo "❌ Erro no deploy. Verifique as mensagens acima."
    exit 1
fi

