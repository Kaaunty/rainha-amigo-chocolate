# Amigo Chocolate - Rainha das Sete

Site interativo para realização de sorteio entre colaboradores no estilo "Amigo Secreto" temático de chocolate.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e dev server
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento
- **Axios** - Cliente HTTP para chamadas de API
- **React Icons** - Biblioteca de ícones

## 📋 Funcionalidades

- ✅ Página inicial com cadastro de participantes
- ✅ Geração de link único para cada participante
- ✅ Visualização restrita do resultado (somente com link válido)
- ✅ Sorteio automático quando número mínimo é atingido
- ✅ Página administrativa com autenticação
- ✅ Visualização de todos os pares (admin)
- ✅ Configuração do número mínimo de participantes
- ✅ Exportação de lista em CSV
- ✅ Reiniciar sorteio (admin)
- ✅ Página de regras
- ✅ Design temático com cores marrom, dourado e creme
- ✅ Layout responsivo

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure a variável de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL da API:
```
VITE_API_URL=http://localhost:3001/api
```

3. Adicione o logo da Rainha das Sete:
   - Coloque o arquivo `logo.png` na pasta `public/`
   - O sistema usará um placeholder caso o arquivo não exista

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:3000`

### Build para produção
```bash
npm run build
```

### Preview da build
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ParticipantForm.tsx
│   ├── AdminLogin.tsx
│   └── LoadingSpinner.tsx
├── pages/           # Páginas da aplicação
│   ├── Home.tsx
│   ├── Participant.tsx
│   ├── Rules.tsx
│   └── Admin.tsx
├── services/        # Serviços e integrações
│   ├── api.ts       # Configuração Axios e funções de API
│   └── email.ts     # Mock de envio de e-mail
├── types/           # Tipagens TypeScript
│   └── index.ts
├── styles/          # Estilos globais
│   └── global.css
├── App.tsx          # Componente principal com rotas
└── main.tsx         # Entry point
```

## 🔌 Integração com Backend

O frontend está preparado para se conectar a uma API REST. Os endpoints esperados são:

### Participantes
- `POST /api/participants` - Cadastrar participante
- `GET /api/participants/token/:token` - Buscar participante por token
- `GET /api/participants` - Listar todos (admin)

### Sorteio
- `GET /api/draw/status` - Status do sorteio

### Admin
- `POST /api/admin/login` - Autenticação admin
- `GET /api/admin/export` - Exportar CSV
- `POST /api/admin/reset` - Reiniciar sorteio
- `PUT /api/admin/config` - Atualizar configurações

## 🎨 Design

O design utiliza uma paleta temática:
- **Marrom**: `#8B4513`, `#A0522D`, `#CD853F`, `#DEB887`
- **Dourado**: `#D4AF37`, `#FFD700`
- **Creme**: `#FFF8DC`, `#F5F5DC`

## 📝 Notas

- O envio de e-mails está mockado (logs no console)
- A autenticação admin usa token armazenado no localStorage
- O logo deve ser adicionado em `public/logo.png`

## 📄 Licença

Este projeto é privado e de uso interno.

