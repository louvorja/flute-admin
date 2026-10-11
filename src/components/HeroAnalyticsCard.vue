<template>
  <div class="card-box hero-card">
    <div class="hero-header">
      <div class="hero-headline">
        <div class="metric-value font-mono">{{ formattedTotal }}</div>
        <div class="metric-subtitle">{{ periodSubtitle }}</div>
      </div>

      <div class="hero-controls">
        <!-- Seletor de Período estilo dropdown pill -->
        <div class="period-pills">
          <button
            v-for="p in periods"
            :key="p.id"
            class="period-pill"
            :class="{ active: selectedPeriod === p.id }"
            @click="$emit('select-period', p.id)"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Legenda com bolinhas coloridas (como na imagem: Músicas, Slides, Inicializações) -->
        <div class="hero-legend">
          <span class="legend-dot-item">
            <span class="dot dot-music"></span> Músicas
          </span>
          <span class="legend-dot-item">
            <span class="dot dot-slides"></span> Slides
          </span>
          <span class="legend-dot-item">
            <span class="dot dot-sessions"></span> Inicializações
          </span>
        </div>
      </div>
    </div>

    <!-- Layout interno: Gráfico de Barras à esquerda + 3 Métricas verticais à direita -->
    <div class="hero-body">
      <!-- Gráfico de Barras Elegante (Inspirado nas barras da imagem) -->
      <div class="chart-area">
        <div class="bars-container">
          <div
            v-for="(day, idx) in chartData"
            :key="day.day"
            class="bar-column"
            :class="{ highlighted: idx === chartData.length - 1 }"
            @mouseenter="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
          >
            <!-- Tooltip flutuante no hover (como no card da imagem) -->
            <div v-if="hoveredIndex === idx" class="bar-tooltip">
              <span class="tooltip-date">{{ day.fullDate }}</span>
              <div class="tooltip-row">
                <span class="dot dot-music"></span>
                <span>Músicas: <strong>{{ day.music }}</strong></span>
              </div>
              <div class="tooltip-row">
                <span class="dot dot-slides"></span>
                <span>Slides: <strong>{{ day.slides }}</strong></span>
              </div>
              <div class="tooltip-row">
                <span class="dot dot-sessions"></span>
                <span>Inicializações: <strong>{{ day.desktop + day.web }}</strong></span>
              </div>
            </div>

            <!-- Trilho de Barra Segmentada (como na imagem com verde, amarelo e cinza suave) -->
            <div class="bar-track">
              <!-- Segmento Slides (Topo) -->
              <div
                class="bar-segment seg-slides"
                :style="{ height: `${day.slidesPct}%` }"
              ></div>
              <!-- Segmento Músicas (Meio com textura/cor) -->
              <div
                class="bar-segment seg-music"
                :style="{ height: `${day.musicPct}%` }"
              ></div>
              <!-- Segmento Base -->
              <div
                class="bar-segment seg-base"
                :style="{ height: `${day.basePct}%` }"
              ></div>
            </div>

            <!-- Rótulo do dia na base (Sun, Mon, Tue, etc.) -->
            <span class="bar-label">{{ day.day }}</span>
          </div>
        </div>
      </div>

      <!-- Métricas Laterais (Total de Músicas, Slides, Dispositivos com textos reativos ao período) -->
      <div class="side-metrics">
        <div class="side-metric-item">
          <span class="side-label">Total de Músicas</span>
          <div class="side-val font-mono">{{ (totalSongs || 0).toLocaleString('pt-BR') }}</div>
          <span class="side-growth" :class="totalSongs > 0 ? 'text-primary' : 'text-muted'">
            {{ totalSongs > 0 ? `↗ ${totalSongs} execuções ${periodGrowthText}` : 'Nenhuma música tocada no período' }}
          </span>
        </div>

        <div class="side-metric-item">
          <span class="side-label">Slides Projetados</span>
          <div class="side-val font-mono">{{ (totalSlides || 0).toLocaleString('pt-BR') }}</div>
          <span class="side-growth" :class="totalSlides > 0 ? 'text-success' : 'text-muted'">
            {{ totalSlides > 0 ? `↗ ${totalSlides} projeções ${periodGrowthText}` : 'Nenhum slide projetado no período' }}
          </span>
        </div>

        <div class="side-metric-item">
          <span class="side-label">Dispositivos Únicos</span>
          <div class="side-val font-mono">{{ (totalDevices || 0).toLocaleString('pt-BR') }}</div>
          <span class="side-growth" :class="totalDevices > 0 ? 'text-warning' : 'text-muted'">
            {{ totalDevices > 0 ? `↗ ${totalDevices} dispositivo(s) ${periodGrowthText}` : 'Nenhum dispositivo ativo' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { WeeklyDayData } from "../services/supabase";

const props = defineProps<{
  totalSongs: number;
  totalSlides: number;
  totalDevices: number;
  selectedPeriod: string;
  weeklyData?: WeeklyDayData[];
}>();

defineEmits<{
  (e: "select-period", period: string): void;
}>();

const periods = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "all", label: "Geral" },
];

const hoveredIndex = ref<number | null>(null);

const formattedTotal = computed(() => {
  const sum = (props.totalSongs || 0) + (props.totalSlides || 0);
  return sum.toLocaleString("pt-BR");
});

const periodSubtitle = computed(() => {
  if (props.selectedPeriod === "30d") return "Execuções de Músicas & Slides nos Últimos 30 Dias";
  if (props.selectedPeriod === "all") return "Execuções de Músicas & Slides em Todo o Histórico";
  return "Execuções de Músicas & Slides nos Últimos 7 Dias";
});

const periodGrowthText = computed(() => {
  if (props.selectedPeriod === "30d") return "nos últimos 30 dias";
  if (props.selectedPeriod === "all") return "no histórico geral";
  return "nos últimos 7 dias";
});

const defaultEmptyChart = computed<WeeklyDayData[]>(() => {
  if (props.selectedPeriod === "30d") {
    return [
      { day: "Sem 1", fullDate: "Semana 1", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Sem 2", fullDate: "Semana 2", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Sem 3", fullDate: "Semana 3", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Sem 4", fullDate: "Semana 4", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    ];
  }
  if (props.selectedPeriod === "all") {
    return [
      { day: "Mai", fullDate: "Maio", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Jun", fullDate: "Junho", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Jul", fullDate: "Julho", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Ago", fullDate: "Agosto", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Set", fullDate: "Setembro", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
      { day: "Out", fullDate: "Outubro", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    ];
  }
  return [
    { day: "Dom", fullDate: "Domingo", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    { day: "Seg", fullDate: "Segunda-feira", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    { day: "Ter", fullDate: "Terça-feira", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    { day: "Qua", fullDate: "Quarta-feira", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    { day: "Qui", fullDate: "Quinta-feira", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    { day: "Sex", fullDate: "Sexta-feira", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
    { day: "Sáb", fullDate: "Sábado", music: 0, slides: 0, desktop: 0, web: 0, slidesPct: 0, musicPct: 0, basePct: 0 },
  ];
});

const chartData = computed(() => {
  if (props.weeklyData && props.weeklyData.length > 0) {
    return props.weeklyData;
  }
  return defaultEmptyChart.value;
});
</script>

<style scoped>
.hero-card {
  padding: 24px;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-headline {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.metric-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.hero-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.period-pills {
  display: inline-flex;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  padding: 3px;
  border-radius: var(--radius-sm);
  gap: 2px;
}

.period-pill {
  padding: 4px 12px;
  font-size: 0.76rem;
  font-weight: 600;
  border-radius: var(--radius-xs);
  color: var(--text-muted);
  transition: all 0.16s ease;
}

.period-pill.active {
  background: var(--bg-card);
  color: var(--text-main);
  box-shadow: var(--shadow-xs);
}

.hero-legend {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.legend-dot-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-music {
  background: var(--primary);
}

.dot-slides {
  background: var(--success);
}

.dot-sessions {
  background: var(--warning);
}

/* Layout interno */
.hero-body {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 24px;
  align-items: flex-end;
}

/* Barras */
.chart-area {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.bars-container {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding-bottom: 24px;
  position: relative;
  border-bottom: 1px solid var(--border-subtle);
}

.bar-column {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.bar-track {
  width: 38px;
  max-width: 100%;
  height: 100%;
  border-radius: 8px;
  background: var(--track-bg);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  transition: transform 0.18s ease;
}

.bar-column:hover .bar-track,
.bar-column.highlighted .bar-track {
  transform: translateY(-2px);
}

.bar-column.highlighted .bar-track {
  box-shadow: 0 4px 14px rgba(0, 151, 215, 0.25);
}

.bar-segment {
  width: 100%;
  transition: height 0.4s ease;
}

/* Cores sincronizadas com a legenda e tooltip:
   - Slides: Verde Esmeralda (var(--success))
   - Músicas: Azul Louvor JA (var(--primary))
   - Inicializações / Sessões: Âmbar (var(--warning))
*/
.seg-slides {
  background: var(--success);
}

.seg-music {
  background: var(--primary);
}

.seg-base {
  background: var(--warning);
}

.bar-column:hover .bar-segment,
.bar-column.highlighted .bar-segment {
  filter: brightness(1.12);
}

.bar-label {
  position: absolute;
  bottom: -24px;
  font-size: 0.74rem;
  color: var(--text-light);
  font-weight: 500;
}

.bar-column.highlighted .bar-label {
  color: var(--text-main);
  font-weight: 700;
}

/* Tooltip */
.bar-tooltip {
  position: absolute;
  top: -90px;
  background: #111827;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

.tooltip-date {
  font-weight: 700;
  display: block;
  margin-bottom: 4px;
  color: #93c5fd;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

/* Métricas Laterais */
.side-metrics {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-left: 20px;
  border-left: 1px solid var(--border-light);
}

.side-metric-item {
  display: flex;
  flex-direction: column;
}

.side-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.side-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.2;
}

.side-growth {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 2px;
}

.text-success {
  color: var(--success);
}

.text-info {
  color: var(--info);
}

@media (max-width: 980px) {
  .hero-card {
    padding: 18px 16px;
  }
  .hero-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 18px;
  }
  .hero-controls {
    align-items: flex-start;
    width: 100%;
    gap: 10px;
  }
  .hero-legend {
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.74rem;
  }
  .hero-body {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .chart-area {
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .bars-container {
    min-width: 300px;
    gap: 8px;
  }
  .bar-track {
    width: 30px;
  }
  .side-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    border-left: none;
    border-top: 1px solid var(--border-light);
    padding-left: 0;
    padding-top: 16px;
  }
}

@media (max-width: 540px) {
  .metric-value {
    font-size: 1.85rem;
  }
  .side-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
