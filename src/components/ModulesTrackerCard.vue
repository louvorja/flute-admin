<template>
  <div class="card-box mini-widget-card">
    <div class="card-header">
      <div>
        <h4 class="card-title">Módulos do Programa</h4>
        <span class="card-sub">Recursos mais executados</span>
      </div>
      <button class="add-goal-btn" @click="$emit('view-all')">
        Ver todos
      </button>
    </div>

    <!-- Lista de Metas / Módulos -->
    <div v-if="modulesList.length === 0" class="empty-modules-box">
      <div class="empty-svg-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="empty-svg">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <p class="empty-text">Nenhum módulo acionado ainda</p>
      <span class="empty-hint">Os módulos aparecerão assim que os operadores utilizarem o programa.</span>
    </div>

    <div v-else class="goals-list">
      <div v-for="mod in modulesList" :key="mod.name" class="goal-item">
        <div class="goal-icon-box" :style="{ '--mod-color': mod.color }">
          <span class="goal-icon-svg" v-html="mod.icon"></span>
        </div>

        <div class="goal-details">
          <div class="goal-top-row">
            <span class="goal-name">{{ mod.name }}</span>
            <span class="goal-values font-mono">
              <strong>{{ mod.count.toLocaleString('pt-BR') }}</strong>
            </span>
          </div>

          <div class="goal-bar-track">
            <div
              class="goal-bar-fill"
              :style="{ width: `${mod.percentage}%`, background: mod.color }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modules?: { name: string; count: number }[];
  }>(),
  {
    modules: () => [],
  }
);

defineEmits<{
  (e: "view-all"): void;
}>();

const defaultMeta = {
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`,
  bg: "#e6f5fc",
  color: "#0097d7",
};

const moduleMeta: Record<string, { icon: string; bg: string; color: string }> = {
  "Louvor & Coletâneas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    bg: "#e0f2fe",
    color: "#0284c7",
  },
  "Coletâneas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    bg: "#e0f2fe",
    color: "#0284c7",
  },
  "Hinário Adventista": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    bg: "#fef3c7",
    color: "#d97706",
  },
  "Hinário Adventista (1996)": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M10 2v8l3-2 3 2V2"/></svg>`,
    bg: "#ffedd5",
    color: "#ea580c",
  },
  "Bíblia Sagrada": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M12 6v6"/><path d="M9.5 8.5h5"/></svg>`,
    bg: "#fef3c7",
    color: "#d97706",
  },
  "Liturgia": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`,
    bg: "#ede9fe",
    color: "#7c3aed",
  },
  "Liturgia de Culto": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`,
    bg: "#ede9fe",
    color: "#7c3aed",
  },
  "Cronômetro": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M12 2v3"/><path d="M10 2h4"/></svg>`,
    bg: "#ffedd5",
    color: "#ea580c",
  },
  "Cronômetro de Culto": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M12 2v3"/><path d="M10 2h4"/></svg>`,
    bg: "#ffedd5",
    color: "#ea580c",
  },
  "Relógio": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    bg: "#e0f2fe",
    color: "#0284c7",
  },
  "Atualização": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
    bg: "#dcfce7",
    color: "#16a34a",
  },
  "Configurações": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    bg: "#f3f4f6",
    color: "#4b5563",
  },
  "Vídeos Online": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="15" rx="3"/><polygon points="10 9 15 11.5 10 14"/></svg>`,
    bg: "#fee2e2",
    color: "#dc2626",
  },
  "Vídeos Personalizados": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    bg: "#fce7f3",
    color: "#db2777",
  },
  "Editor de Música": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    bg: "#e0e7ff",
    color: "#4f46e5",
  },
  "Editor de Músicas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    bg: "#e0e7ff",
    color: "#4f46e5",
  },
  "Sorteio": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/></svg>`,
    bg: "#fef9c3",
    color: "#ca8a04",
  },
  "Ajuda e Suporte": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    bg: "#e0e7ff",
    color: "#4f46e5",
  },
  "Ajuda & Suporte": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    bg: "#e0e7ff",
    color: "#4f46e5",
  },
  "Coletâneas Personalizadas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    bg: "#fae8ff",
    color: "#a21caf",
  },
  "Página Inicial": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    bg: "#e0f2fe",
    color: "#0284c7",
  },
  "Biblioteca Local": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    bg: "#ccfbf1",
    color: "#0d9488",
  },
  "Mensagens & Avisos": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    bg: "#e0f2fe",
    color: "#0284c7",
  },
  "Sistema Principal": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    bg: "#f3e8ff",
    color: "#9333ea",
  },
};

const modulesList = computed(() => {
  const source = props.modules || [];
  if (source.length === 0) return [];

  const max = Math.max(...source.map((m) => m.count), 1);

  return source.slice(0, 4).map((m) => {
    const meta = moduleMeta[m.name] || defaultMeta;
    return {
      name: m.name,
      count: m.count,
      percentage: Math.min(100, Math.round((m.count / max) * 100)),
      icon: meta.icon,
      bg: meta.bg,
      color: meta.color,
    };
  });
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
  margin-bottom: 16px;
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

.add-goal-btn {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  padding: 3px 9px;
  border-radius: var(--radius-xs);
  transition: opacity 0.16s ease;
}

.add-goal-btn:hover {
  opacity: 0.85;
}

/* Goals List */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goal-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--mod-color);
  background-color: color-mix(in srgb, var(--mod-color) 12%, transparent);
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.goal-item:hover .goal-icon-box {
  transform: scale(1.05);
}

.goal-icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.goal-icon-svg :deep(svg) {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

:global(html.dark) .goal-icon-box,
:global(body.dark) .goal-icon-box,
:global(.dark) .goal-icon-box {
  background-color: color-mix(in srgb, var(--mod-color) 22%, rgba(255, 255, 255, 0.04)) !important;
  border: 1px solid color-mix(in srgb, var(--mod-color) 35%, transparent);
}

.goal-details {
  flex: 1;
  min-width: 0;
}

.goal-top-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
  gap: 8px;
}

.goal-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-values {
  font-size: 0.72rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.goal-values strong {
  color: var(--text-main);
}

.goal-bar-track {
  width: 100%;
  height: 6px;
  background: var(--track-bg);
  border-radius: 99px;
  overflow: hidden;
}

.goal-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.empty-modules-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 12px;
  gap: 6px;
}

.empty-svg-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--track-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.empty-svg {
  width: 22px;
  height: 22px;
  color: var(--text-light);
}

.empty-modules-box .empty-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.empty-modules-box .empty-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  line-height: 1.3;
}
</style>
