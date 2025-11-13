# 📡 Endpoints do Supabase

## Base URL

```
https://seu-project-ref.supabase.co/functions/v1
```

Configure no `.env` do frontend:
```env
VITE_API_URL=https://seu-project-ref.supabase.co/functions/v1
```

## Endpoints Disponíveis

### 1. Cadastrar Participante
**POST** `/register-participant`

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com"
}
```

**Response:**
```json
{
  "participant": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "token": "abc123",
    "createdAt": "2024-01-15T10:30:00Z",
    "matchedWith": null
  },
  "link": "https://seu-site.com/participante/abc123"
}
```

---

### 2. Buscar Participante por Token
**GET** `/get-participant?token=abc123`

**Response:**
```json
{
  "participant": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "token": "abc123",
    "createdAt": "2024-01-15T10:30:00Z",
    "matchedWith": "uuid2",
    "matchedWithName": "Maria Santos"
  },
  "matchedParticipant": {
    "id": "uuid2",
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "token": "xyz789",
    "createdAt": "2024-01-15T11:00:00Z",
    "matchedWith": "uuid",
    "matchedWithName": "João Silva"
  }
}
```

---

### 3. Status do Sorteio
**GET** `/draw-status`

**Response:**
```json
{
  "isDrawn": false,
  "totalParticipants": 8,
  "minParticipants": 5,
  "canDraw": true
}
```

---

### 4. Login Admin
**POST** `/admin-login`

**Request:**
```json
{
  "password": "senha_admin"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token"
}
```

---

### 5. Listar Participantes (Admin)
**GET** `/admin-participants`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid1",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "token": "abc123",
    "createdAt": "2024-01-15T10:30:00Z",
    "matchedWith": "uuid2",
    "matchedWithName": "Maria Santos"
  }
]
```

---

### 6. Exportar CSV (Admin)
**GET** `/admin-export`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `text/csv`
- Body: Arquivo CSV

---

### 7. Reiniciar Sorteio (Admin)
**POST** `/admin-reset`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Sorteio reiniciado com sucesso"
}
```

---

### 8. Atualizar Configuração (Admin)
**PUT** `/admin-config`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "minParticipants": 10
}
```

**Response:**
```json
{
  "success": true,
  "minParticipants": 10
}
```

---

## Códigos de Erro

- `200` - Sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (token inválido)
- `404` - Not Found
- `500` - Internal Server Error

Todas as respostas de erro seguem o formato:
```json
{
  "message": "Mensagem de erro"
}
```

