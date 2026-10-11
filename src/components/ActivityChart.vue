<template>
  <div class="activity-card glass-panel">
    <div class="card-header">
      <div>
        <h2 class="card-title font-display">
          Pessoas Ativas por Dia (DAU)
        </h2>
        <p class="card-subtitle">
          Volume diário de dispositivos únicos executando o Louvor JA
        </p>
      </div>

      <div class="chart-legend font-mono">
        <span class="legend-item">
          <span class="legend-color desktop-color" /> Desktop
        </span>
        <span class="legend-item">
          <span class="legend-color web-color" /> Web / PWA
        </span>
      </div>
    </div>

    <div class="chart-container">
      <svg :viewBox="`0 0 ${width} ${height}`" class="dau-svg" preserveAspectRatio="none">
        <!-- Linhas de grade horizontais -->
        <g class="grid-lines">
          <line
            v-for="tick in yTicks"
            :key="tick.value"
            x1="36"
            :y1="tick.y"
            :x2="width - 12"
            :y2="tick.y"
            stroke="rgba(255,255,255,0.06)"
            stroke-dasharray="3 3"
          />
          <text
            v-for="tick in yTicks"
            :key="'label-' + tick.value"
            x="30"
            :y="tick.y + 4"
            text-anchor="end"
            class="axis-label font-mono"
          >
            {{ tick.value }}
          </text>
        </g>

        <!-- Barras de dias -->
        <g v-for="(item, i) in data" :key="item.date">
          <!-- Barra Total / Web -->
          <rect
            :x="getX(i)"
            :y="getY(item.desktop + item.web)"
            :width="barWidth"
            :height="getHeight(item.desktop + item.web)"
            rx="4"
            class="bar-web"
          >
            <title>{{ item.date }}: {{ item.desktop + item.web }} pessoas no total</title>
          </rect>

          <!-- Barra Desktop -->
          <rect
            :x="getX(i) + barWidth * 0.15"
            :y="getY(item.desktop)"
            :width="barWidth * 0.7"
            :height="getHeight(item.desktop)"
            rx="3"
            class="bar-desktop"
          >
            <title>{{ item.date }}: {{ item.desktop }} no Desktop</title>
          </rect>

          <!-- Rótulo de Data -->
          <text
            :x="getX(i) + barWidth / 2"
            :y="height - 8"
            text-anchor="middle"
            class="axis-label font-mono"
          >
            {{ item.date }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: { date: string; desktop: number; web: number }[];
}>();

const width = 860;
const height = 220;
const paddingLeft = 40;
const paddingBottom = 28;
const paddingTop = 20;

const maxVal = computed(() => {
  if (!props.data || props.data.length === 0) return 80;
  const highest = Math.max(...props.data.map((d) => d.desktop + d.web));
  return Math.max(20, Math.ceil(highest / 20) * 20);
});

const barWidth = computed(() => {
  const n = props.data.length || 1;
  const available = width - paddingLeft - 20;
  return Math.min(46, (available / n) * 0.7);
});

const yTicks = computed(() => {
  const max = maxVal.value;
  const steps = [0, max * 0.33, max * 0.66, max];
  const chartHeight = height - paddingTop - paddingBottom;
  return steps.map((v) => ({
    value: Math.round(v),
    y: paddingTop + chartHeight - (v / max) * chartHeight,
  }));
});

function getX(index: number) {
  const n = props.data.length || 1;
  const available = width - paddingLeft - 20;
  const step = available / n;
  return paddingLeft + index * step + (step - barWidth.value) / 2;
}

function getY(val: number) {
  const chartHeight = height - paddingTop - paddingBottom;
  return paddingTop + chartHeight - (val / maxVal.value) * chartHeight;
}

function getHeight(val: number) {
  const chartHeight = height - paddingTop - paddingBottom;
  return Math.max(2, (val / maxVal.value) * chartHeight);
}
</script>

<style scoped>
.activity-card {
  padding: 22px 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 0.78rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.desktop-color {
  background: var(--accent-cyan);
}

.web-color {
  background: rgba(0, 210, 255, 0.28);
}

.chart-container {
  width: 100%;
  height: 220px;
}

.dau-svg {
  width: 100%;
  height: 100%;
}

.axis-label {
  fill: var(--text-dim);
  font-size: 10px;
}

.bar-web {
  fill: rgba(0, 210, 255, 0.22);
  stroke: rgba(0, 210, 255, 0.45);
  stroke-width: 1;
}

.bar-desktop {
  fill: var(--accent-cyan);
  transition: opacity 0.2s;
}

.bar-desktop:hover {
  opacity: 0.85;
}
</style>
