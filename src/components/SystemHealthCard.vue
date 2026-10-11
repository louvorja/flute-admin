<template>
  <div class="card-box mini-widget-card">
    <div class="card-header">
      <div>
        <h4 class="card-title">Saúde do Sistema</h4>
        <span class="card-sub">Estabilidade operacional</span>
      </div>
      <span class="period-tag font-mono">{{ periodLabel }}</span>
    </div>

    <!-- Valor de Destaque -->
    <div class="highlight-val font-mono">{{ stabilityRate }}%</div>
    <div class="growth-label" :class="(errorCount || 0) === 0 ? 'text-success' : 'text-danger'">
      {{ (errorCount || 0) === 0 ? '↗ 100% cultos sem falhas' : `↘ ${errorCount} falha(s) registrada(s)` }}
    </div>

    <!-- Gauge Semi-Circular SVG (como o 75% da imagem) -->
    <div class="gauge-wrap">
      <svg viewBox="0 0 160 90" class="gauge-svg">
        <!-- Arco Base de Fundo -->
        <path
          d="M 15 80 A 65 65 0 0 1 145 80"
          fill="none"
          class="gauge-base-track"
          stroke-width="16"
          stroke-linecap="round"
        />
        <!-- Arco Ativo Verde Vibrante -->
        <path
          d="M 15 80 A 65 65 0 0 1 145 80"
          fill="none"
          stroke="url(#healthGrad)"
          stroke-width="16"
          stroke-linecap="round"
          stroke-dasharray="204"
          :stroke-dashoffset="dashOffset"
          class="animated-gauge"
        />
        <defs>
          <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="40%" stop-color="#4ade80" />
            <stop offset="100%" stop-color="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <div class="gauge-inner-val font-mono">
        <span class="gauge-percent">{{ stabilityRate }}%</span>
        <span class="gauge-sub">{{ (errorCount || 0) === 0 ? 'Operação Normal' : 'Atenção Requerida' }}</span>
      </div>
    </div>

    <div class="footer-note">
      Telemetria em tempo real • Supabase Flute
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    errorCount?: number;
    totalRuns?: number;
    period?: string;
  }>(),
  {
    errorCount: 0,
    totalRuns: 0,
    period: "7d",
  }
);

const periodLabel = computed(() => {
  if (props.period === "30d") return "30d";
  if (props.period === "all") return "Geral";
  return "7d";
});

const stabilityRate = computed(() => {
  if (!props.errorCount || props.errorCount === 0) return 100;
  const runs = Math.max(1, props.totalRuns || 1);
  const rate = 100 - (props.errorCount / runs) * 100;
  return Math.min(100, Math.max(0, Number(rate.toFixed(1))));
});

const dashOffset = computed(() => {
  // Arco completo tem 204 unidades. Offset proporcional.
  const p = (100 - stabilityRate.value) / 100;
  return Math.round(204 * p);
});
</script>

<style scoped>
.mini-widget-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.card-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.period-tag {
  font-size: 0.7rem;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  color: var(--text-muted);
}

.highlight-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
}

.growth-label {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 2px;
  margin-bottom: 12px;
}

.text-success {
  color: var(--success);
}

/* Gauge Semi Circular */
.gauge-wrap {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 6px 0 12px;
}

.gauge-svg {
  width: 160px;
  height: 90px;
}

.gauge-base-track {
  stroke: var(--track-bg);
  transition: stroke 0.25s ease;
}

.animated-gauge {
  transition: stroke-dashoffset 0.6s ease;
}

.gauge-inner-val {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.gauge-percent {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
}

.gauge-sub {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: var(--font-family);
  margin-top: 2px;
}

.footer-note {
  font-size: 0.68rem;
  color: var(--text-light);
  text-align: center;
  margin-top: auto;
}
</style>
