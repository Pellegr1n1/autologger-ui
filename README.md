# AutoLogger UI

Frontend da aplicação AutoLogger - Sistema de gestão de manutenção de veículos com integração blockchain.

## 📋 Sobre o Projeto

AutoLogger é uma aplicação web moderna para gerenciamento completo de manutenção de veículos. O frontend oferece uma interface intuitiva e responsiva para cadastro de veículos, registro de serviços, geração de relatórios e visualização de dados na blockchain.

🌐 **Acesso**

- **RFC**: [Documento_de_RFC_Autologger_Besu.pdf](https://github.com/user-attachments/files/23918038/Documento_de_RFC_Autologger_Besu.pdf)
- **API em Produção**: [https://api.autologger.online](https://api.autologger.online)
- **Documentação Swagger**: [https://api.autologger.online/api](https://api.autologger.online/api)
- **Health Check**: [https://api.autologger.online/health](https://api.autologger.online/health)

## 🚀 Tecnologias

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.7** - Superset JavaScript com tipagem estática
- **Vite 6** - Build tool e dev server de alta performance
- **Ant Design 5** - Biblioteca de componentes UI
- **React Router 7** - Roteamento para aplicações React
- **Recharts** - Biblioteca de gráficos
- **Jest** - Framework de testes
- **ESLint** - Linter para qualidade de código

## 📁 Estrutura do Projeto

```
autologger-ui/
├── public/                 # Arquivos estáticos
├── src/
│   ├── app/               # Configuração da aplicação
│   │   └── router/        # Configuração de rotas
│   ├── components/        # Componentes reutilizáveis
│   │   ├── layout/        # Componentes de layout (Header, Sider, etc)
│   │   └── ui/            # Componentes UI genéricos
│   ├── features/          # Features organizadas por domínio
│   │   ├── auth/          # Autenticação e autorização
│   │   ├── blockchain/    # Integração blockchain
│   │   └── vehicles/      # Gestão de veículos
│   ├── pages/             # Páginas da aplicação
│   │   ├── Auth/          # Login, registro, recuperação de senha
│   │   ├── Vehicles/      # Gestão de veículos
│   │   ├── Maintenance/    # Gestão de serviços
│   │   ├── Reports/        # Relatórios e gráficos
│   │   ├── Blockchain/     # Status e transações blockchain
│   │   ├── Profile/        # Perfil do usuário
│   │   └── PublicVehicle/  # Consulta pública de veículos
│   ├── shared/            # Código compartilhado
│   │   ├── api/           # Cliente API e configurações
│   │   ├── hooks/         # React hooks customizados
│   │   ├── services/      # Serviços compartilhados
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Funções utilitárias
│   ├── styles/            # Estilos globais
│   ├── App.tsx            # Componente raiz
│   └── main.tsx           # Ponto de entrada
├── .env.example           # Exemplo de variáveis de ambiente
├── Dockerfile             # Configuração Docker
├── nginx.conf             # Configuração Nginx
├── package.json           # Dependências e scripts
├── tsconfig.json          # Configuração TypeScript
└── vite.config.ts         # Configuração Vite
```

## 🎨 Funcionalidades Principais

### Autenticação
- ✅ Login com email/senha
- ✅ Login com Google OAuth
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Verificação de email
- ✅ Gerenciamento de sessão

### Gestão de Veículos
- ✅ Cadastro de veículos com fotos
- ✅ Listagem e busca de veículos
- ✅ Edição e exclusão de veículos
- ✅ Visualização detalhada

### Gestão de Serviços
- ✅ Cadastro de serviços de manutenção
- ✅ Registro na blockchain
- ✅ Histórico completo de serviços
- ✅ Upload de comprovantes

### Relatórios
- ✅ Gráficos de custos
- ✅ Estatísticas de manutenção
- ✅ Histórico por período
- ✅ Exportação de dados

### Blockchain
- ✅ Visualização de status da rede
- ✅ Histórico de transações
- ✅ Verificação de integridade
- ✅ Estatísticas do contrato

### Perfil
- ✅ Edição de dados pessoais
- ✅ Alteração de senha
- ✅ Exclusão de conta

## 🏗️ Arquitetura

A aplicação segue uma arquitetura modular baseada em features:

- **Features**: Organização por domínio de negócio (auth, vehicles, blockchain)
- **Pages**: Componentes de página completos
- **Components**: Componentes reutilizáveis
- **Shared**: Código compartilhado entre features

## 🔐 Segurança

- Tokens JWT armazenados em cookies httpOnly
- Validação de dados no frontend e backend
- Proteção CSRF
- Sanitização de inputs
- Rotas protegidas com guards

