<template>
  <div class="heatmap-card glass-panel">
    <div class="card-header">
      <div>
        <h2 class="card-title font-display">
          Mapa de Calor Semanal dos Cultos
        </h2>
        <p class="card-subtitle">
          Distribuição de músicas e slides por dia e hora (destaque para quartas, sextas e sábados)
        </p>
      </div>

      <div class="heatmap-legend font-mono">
        <span class="legend-text">Menos atividade</span>
        <div class="legend-scale">
          <span class="scale-box s-0" />
          <span class="scale-box s-1" />
          <span class="scale-box s-2" />
          <span class="scale-box s-3" />
          <span class="scale-box s-4" />
        </div>
        <span class="legend-text">Pico de culto</span>
      </div>
    </div>

    <div class="heatmap-scroll">
      <div class="heatmap-grid">
        <!-- Linha do cabeçalho com horas 0 a 23 -->
        <div class="grid-header-corner" />
        <div v-for="h in 24" :key="'h-' + (h - 1)" class="grid-hour-header font-mono">
          {{ h - 1 }}h
        </div>

        <!-- Linhas dos dias da semana (Dom a Sáb) -->
        <template v-for="(dayName, dayIndex) in dayNames" :key="dayName">
          <div class="grid-day-label font-mono">
            {{ dayName }}
          </div>
          <div
            v-for="h in 24"
            :key="`cell-${dayIndex}-${h - 1}`"
            class="heat-cell"
            :class="getIntensityClass(heatmap[dayIndex]?.[h - 1] || 0)"
            :title="`${dayName} às ${h - 1}h: ${heatmap[dayIndex]?.[h - 1] || 0} execuções`"
          >
            <span v-if="(heatmap[dayIndex]?.[h - 1] || 0) > 40" class="cell-num font-mono">
              {{ heatmap[dayIndex][h - 1] }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  heatmap: number[][]; // [0..6][0..23]
}>();

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const maxCount = computed(() => {
  let highest = 1;
  for (const day of props.heatmap || []) {
    for (const val of day || []) {
      if (val > highest) highest = val;
    }
  }
  return highest;
});

function getIntensityClass(val: number): string {
  if (val === 0) return "cell-0";
  const ratio = val / maxCount.value;
  if (ratio > 0.65) return "cell-4";
  if (ratio > 0.4) return "cell-3";
  if (ratio > 0.18) return "cell-2";
  return "cell-1";
}
</script>

<style scoped>
.heatmap-card {
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

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: var(--text-dim);
}

.legend-scale {
  display: flex;
  gap: 3px;
}

.scale-box {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.s-0 { background: #181d33; }
.s-1 { background: #1e3a5f; }
.s-2 { background: #1c6496; }
.s-3 { background: #0ea5e9; }
.s-4 { background: #ff914d; }

.heatmap-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
}

.heatmap-grid {
  display: grid;
  grid-template-columns: 42px repeat(24, minmax(28px, 1fr));
  gap: 4px;
  min-width: 780px;
}

.grid-header-corner {
  height: 20px;
}

.grid-hour-header {
  font-size: 0.65rem;
  color: var(--text-dim);
  text-align: center;
  user-select: none;
}

.grid-day-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  font-weight: 600;
}

.heat-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, outline 0.15s ease;
}

.heat-cell:hover {
  transform: scale(1.15);
  outline: 1.5px solid #ffffff;
  z-index: 2;
}

.cell-0 { background: #14172a; }
.cell-1 { background: #1d345a; }
.cell-2 { background: #1a5b8b; }
.cell-3 { background: #0284c7; }
.cell-4 {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
}

.cell-num {
  font-size: 0.58rem;
  font-weight: 700;
  color: #ffffff;
}
</style>
