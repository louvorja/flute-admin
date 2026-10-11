<template>
  <div class="card-box mini-widget-card">
    <div class="card-header">
      <div>
        <h4 class="card-title">Sistemas Operacionais</h4>
        <span class="card-sub">Dispositivos registrados</span>
      </div>
      <span class="period-tag font-mono">{{ periodLabel }}</span>
    </div>

    <!-- Valor de Destaque -->
    <div class="highlight-val font-mono">{{ total || 0 }}</div>

    <div v-if="platforms.length === 0" class="empty-platform-state text-muted">
      Nenhum sistema operacional registrado ainda
    </div>

    <template v-else>
      <!-- Barra Segmentada Horizontal -->
      <div class="segmented-bar">
        <div
          v-for="item in platforms"
          :key="item.name"
          class="bar-slice"
          :style="{ width: `${item.percentage}%`, backgroundColor: item.color }"
          :title="`${item.name}: ${item.percentage}%`"
        ></div>
      </div>

      <!-- Lista com Porcentagens -->
      <div class="legend-list">
        <div v-for="item in platforms" :key="item.name" class="legend-row">
          <div class="legend-left">
            <span class="color-bullet" :style="{ backgroundColor: item.color }"></span>
            <span class="platform-name">{{ item.name }}</span>
          </div>
          <span class="platform-pct font-mono">{{ item.percentage }}%</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    total?: number;
    data?: { name: string; count: number }[];
    period?: string;
  }>(),
  {
    total: 0,
    data: () => [],
    period: "7d",
  }
);

const periodLabel = computed(() => {
  if (props.period === "30d") return "30d";
  if (props.period === "all") return "Geral";
  return "7d";
});

const colors: Record<string, string> = {
  Windows: "#0097d7",
  macOS: "#f59e0b",
  Linux: "#10b981",
  "Web / PWA": "#8b5cf6",
};

const platforms = computed(() => {
  if (!props.data || props.data.length === 0) {
    return [];
  }
  const sum = props.data.reduce((acc, cur) => acc + cur.count, 0) || 1;
  return props.data.map((d) => ({
    name: d.name,
    count: d.count,
    percentage: Math.round((d.count / sum) * 100),
    color: colors[d.name] || "#6b7280",
  }));
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
  margin-bottom: 12px;
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
  margin-bottom: 12px;
}

/* Barra Segmentada */
.segmented-bar {
  display: flex;
  height: 12px;
  border-radius: 99px;
  overflow: hidden;
  gap: 3px;
  background: var(--track-bg);
  margin-bottom: 16px;
}

.bar-slice {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}

/* Lista */
.legend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-bullet {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.platform-name {
  color: var(--text-secondary);
}

.platform-pct {
  font-weight: 700;
  color: var(--text-main);
}
</style>
