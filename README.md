# Louvor JA • Painel Administrativo & Telemetria

Painel administrativo e analítico em tempo real para gestão, telemetria e comunicação com os usuários do **Louvor JA (Flute)**.

---

## 🚀 Funcionalidades Integradas

### 📊 Telemetria & Indicadores em Tempo Real
- **Métricas Globais:** Total de instalações ativas, usuários únicos ativos no dia, músicas reproduzidas, slides projetados e taxa de integridade.
- **Mapa de Calor Semanal:** Visualização horária dos cultos e eventos durante todos os dias da semana (quartas, sextas, sábados e domingos).
- **Músicas Mais Tocadas:** Ranking de músicas mais executadas, conclusão de reprodução e modos de áudio (cantado vs. playback).
- **Módulos Mais Utilizados:** Estatísticas de engajamento por ferramenta e distribuição por sistema operacional (Windows, macOS, Linux, Web).

### 🔔 Central de Notificações
- Emissão de comunicados e alertas para o aplicativo Louvor JA.
- Tipos de mensagens: Informação, Atualização, Aviso e Sucesso.
- Suporte a links de ação externa e ativação/desativação dinâmica.

### 🛡️ Monitoramento & Gestão de Erros
- Agrupamento inteligente de exceções idênticas para evitar poluição visual.
- Contador de recorrências por erro e rastreamento de versões/plataformas afetadas.
- Modal com detalhes completos da pilha de erro (*stack trace*).
- Ação para marcar falhas como revisadas e zerar contadores.

### 💬 Suporte & Chamados
- Visualização e triagem de dúvidas, sugestões e relatos de problemas enviados pela comunidade.
- Dados de diagnóstico do ambiente de execução (versão do app, sistema e banco de dados).

### 🔐 Acesso Administrativo & Perfil
- Acesso restrito a administradores autorizados.
- Login flexível com **Nome de Usuário** ou **E-mail**.
- Modal de perfil com atualização direta de dados cadastrais e troca de senha.
- Interface totalmente responsiva, adaptada para telas desktop e mobile (< 980px).

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API com TypeScript)
- **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
- **Estilização:** CSS Vanilla com variáveis customizadas, design tokens e glassmorphism
- **Backend & Banco de Dados:** Nuvem (Supabase / Postgres com RPCs seguras)
- **Deploy:** GitHub Actions & GitHub Pages com domínio personalizado

---

## 💻 Como Rodar Localmente

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/louvorja/flute-admin.git
cd flute-admin
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):
```env
VITE_CLOUD_ENDPOINT=https://seu-endpoint-nuvem.co
VITE_CLOUD_TOKEN=seu-token-de-acesso
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
O painel estará disponível em `http://localhost:3333`.

---

## 📦 Build e Publicação

Para gerar o pacote otimizado para produção:
```bash
npm run build
```
Os arquivos finais compilados serão gerados na pasta `dist/`.

O deploy para produção (`adm-flute.louvorja.com.br`) é executado automaticamente via **GitHub Actions** em qualquer push para a branch `main`.
