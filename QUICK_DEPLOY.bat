@echo off
REM Script rápido para fazer deploy da Edge Function send-email (Windows)

echo 🚀 Iniciando deploy da Edge Function send-email...
echo.

REM Verificar se Supabase CLI está instalado
where supabase >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI não encontrado!
    echo    Instale com: npm install -g supabase
    pause
    exit /b 1
)

echo ✅ Supabase CLI encontrado
echo.

REM Verificar se está logado
echo 🔐 Verificando login...
supabase projects list >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Não está logado. Fazendo login...
    supabase login
)

echo ✅ Login verificado
echo.

REM Linkar ao projeto
echo 🔗 Verificando link com o projeto...
supabase link --project-ref ebwsbboixpyafrritktv
echo.

REM Fazer deploy
echo 📦 Fazendo deploy da função send-email...
supabase functions deploy send-email

if %errorlevel% equ 0 (
    echo.
    echo ✅ Deploy concluído com sucesso!
    echo.
    echo 📝 Próximos passos:
    echo    1. Configure as Secrets no Dashboard do Supabase:
    echo       - RESEND_API_KEY
    echo       - RESEND_FROM_EMAIL
    echo    2. Verifique o arquivo .env com VITE_API_URL
    echo    3. Reinicie o servidor de desenvolvimento
    echo    4. Teste no painel admin
) else (
    echo.
    echo ❌ Erro no deploy. Verifique as mensagens acima.
)

pause

