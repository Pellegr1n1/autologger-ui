# Funcionalidade de Compartilhamento de Histórico Veicular

## 📋 Visão Geral

Esta funcionalidade permite que proprietários de veículos compartilhem o histórico de manutenções de seus veículos através de links públicos e QR Codes, facilitando a venda em plataformas como OLX e outros marketplaces.

## 🚀 Funcionalidades Implementadas

### Backend (autologger-service)

1. **Entidade VehicleShare** (`src/modules/vehicle/entities/vehicle-share.entity.ts`)
   - Armazena tokens de compartilhamento
   - Controla expiração e ativação dos links
   - Rastreia visualizações

2. **Serviço VehicleShareService** (`src/modules/vehicle/services/vehicle-share.service.ts`)
   - Gera tokens únicos de compartilhamento
   - Busca informações públicas do veículo
   - Gerencia expiração e desativação de links

3. **Controller VehicleShareController** (`src/modules/vehicle/controllers/vehicle-share.controller.ts`)
   - `POST /vehicles/:id/generate-share-link` - Gerar link de compartilhamento
   - `GET /vehicles/share/:shareToken` - Visualizar informações públicas
   - `DELETE /vehicles/share/:shareToken` - Desativar link
   - `GET /vehicles/my-shares` - Listar links do usuário

4. **DTOs de Resposta** (`src/modules/vehicle/dto/vehicle-share-response.dto.ts`)
   - `VehicleShareResponseDto` - Resposta do link gerado
   - `PublicVehicleInfoDto` - Informações públicas do veículo
   - `PublicMaintenanceInfoDto` - Histórico de manutenções público

### Frontend (autologger-ui)

1. **Serviço VehicleShareService** (`src/features/vehicles/services/vehicleShareService.ts`)
   - Comunicação com API de compartilhamento
   - Tipos TypeScript para as respostas

2. **Modal de Compartilhamento** (`src/features/vehicles/components/VehicleShareModal.tsx`)
   - Interface para gerar e gerenciar links
   - Geração de QR Code
   - Instruções de compartilhamento
   - Avisos de conformidade LGPD

3. **Página Pública** (`src/pages/PublicVehicle/PublicVehiclePage.tsx`)
   - Visualização sem autenticação
   - Histórico completo de manutenções
   - Informações essenciais do veículo
   - Design responsivo e atrativo

4. **Integração na Modal do Veículo** (`src/features/vehicles/components/VehicleModal.tsx`)
   - Botão de compartilhamento no header
   - Abertura da modal de compartilhamento

## 🔒 Conformidade com LGPD

### Dados Compartilhados (Públicos)
- ✅ Informações básicas do veículo (marca, modelo, ano, cor, placa)
- ✅ Quilometragem atual
- ✅ Histórico de manutenções e serviços
- ✅ Status de confirmação blockchain
- ✅ Data de cadastro no sistema

### Dados NÃO Compartilhados (Protegidos)
- ❌ Dados pessoais do proprietário
- ❌ Informações de contato
- ❌ Dados de login e autenticação
- ❌ Informações financeiras pessoais

### Medidas de Segurança
- Links com expiração automática (30 dias por padrão)
- Tokens únicos e não previsíveis
- Controle de ativação/desativação
- Rastreamento de visualizações
- Verificação de propriedade do veículo

## 📱 Como Usar

### Para o Proprietário do Veículo

1. **Acessar a modal do veículo** na página "Meus Veículos"
2. **Clicar no botão de compartilhamento** (ícone de compartilhar no header)
3. **Gerar o link** clicando em "Gerar Link de Compartilhamento"
4. **Copiar o link** ou baixar o QR Code
5. **Compartilhar** em OLX, WhatsApp, email, etc.

### Para o Comprador Potencial

1. **Acessar o link** ou escanear o QR Code
2. **Visualizar informações** do veículo e histórico
3. **Verificar autenticidade** através dos hashes blockchain
4. **Tomar decisão** baseada no histórico transparente

## 🛠️ Configuração

### Variáveis de Ambiente

No backend (`autologger-service`):
```env
FRONTEND_URL=http://localhost:3000
```

### Dependências Adicionais

No frontend (`autologger-ui`):
```json
{
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

## 📊 Endpoints da API

### Gerar Link de Compartilhamento
```http
POST /vehicles/:id/generate-share-link?expiresInDays=30
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "shareToken": "abc123...",
  "shareUrl": "http://localhost:3000/vehicles/share/abc123...",
  "expiresAt": "2024-02-19T10:30:00Z",
  "isActive": true
}
```

### Visualizar Informações Públicas
```http
GET /vehicles/share/:shareToken
```

**Resposta:**
```json
{
  "id": "vehicle-uuid",
  "plate": "ABC1234",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "Branco",
  "mileage": 50000,
  "status": "active",
  "createdAt": "2024-01-19T10:30:00Z",
  "photoUrl": "https://...",
  "maintenanceHistory": [...]
}
```

## 🎨 Interface do Usuário

### Modal de Compartilhamento
- **Header com gradiente** e ícone de compartilhamento
- **Informações do link** com data de expiração
- **QR Code gerado** automaticamente
- **Instruções de uso** para diferentes plataformas
- **Aviso de conformidade LGPD**

### Página Pública
- **Design responsivo** com gradiente de fundo
- **Cards informativos** com estatísticas
- **Timeline de manutenções** cronológica
- **Verificação blockchain** visível
- **Avisos de transparência** e conformidade

## 🔧 Manutenção

### Limpeza de Links Expirados
Os links expiram automaticamente após 30 dias (configurável). Para limpeza manual:

```sql
DELETE FROM vehicle_shares 
WHERE expires_at < NOW() AND is_active = false;
```

### Monitoramento
- Contador de visualizações por link
- Data da última visualização
- Status de ativação/desativação

## 🚨 Considerações Importantes

1. **Segurança**: Tokens são gerados com criptografia forte
2. **Performance**: Índices otimizados para consultas rápidas
3. **Escalabilidade**: Suporte a múltiplos usuários simultâneos
4. **Conformidade**: Totalmente alinhado com LGPD
5. **Usabilidade**: Interface intuitiva e responsiva

## 📈 Benefícios

### Para Vendedores
- ✅ Transparência total do histórico
- ✅ Aumento da confiança do comprador
- ✅ Facilidade de compartilhamento
- ✅ Diferencial competitivo

### Para Compradores
- ✅ Histórico verificado e imutável
- ✅ Informações completas e transparentes
- ✅ Verificação blockchain
- ✅ Decisão informada

### Para a Plataforma
- ✅ Diferencial de mercado
- ✅ Conformidade legal
- ✅ Engajamento de usuários
- ✅ Transparência e confiança
