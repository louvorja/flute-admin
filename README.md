# Louvor JA • Painel Administrativo de Telemetria

Site administrativo próprio para acompanhamento em tempo real do uso do **Louvor JA (Flute)**.

## Recursos Integrados:
- **Indicadores em Tempo Real:** Instalações ativas, pessoas hoje, músicas tocadas, projeções e falhas.
- **Gráfico de DAU (Pessoas Ativas por Dia):** Comparativo visual Desktop vs Web/PWA.
- **Mapa de Calor Semanal dos Cultos:** Análise das 24 horas dos 7 dias da semana (quartas, sextas, sábados e domingos).
- **Músicas Mais Tocadas:** Ranking de músicas mais abertas e ouvidas até o fim com barra de progresso.
- **Módulos & Sistemas Operacionais:** Estatísticas de engajamento por ferramenta e plataforma (Windows, Mac, Linux, Web).
- **Rastreador de Erros:** Monitoramento de exceções capturadas com mensagens, versão e horário.
- **Conexão Direta ao Supabase:** Conectado ao projeto `flute` (`vktovorubdurbkpssgty.supabase.co`).
- **Alternância de Modo:** Suporta alternar instantaneamente entre dados reais do Supabase e dados de amostra.

## Como rodar o site localmente:

1. Acesse esta pasta:
   ```bash
   cd admin
   ```

2. Instale as dependências (se necessário):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O painel estará disponível em `http://localhost:3333`.

4. Para gerar a build de produção:
   ```bash
   npm run build
   ```
