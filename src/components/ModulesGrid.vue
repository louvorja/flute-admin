<template>
  <div class="modules-platforms-grid">
    <!-- Card de Módulos (Mais Usados vs Ver Todos) -->
    <div class="card-box modules-card">
      <div class="card-header-row">
        <div>
          <h2 class="card-title">
            {{ viewMode === 'top' ? 'Módulos Mais Utilizados' : 'Todos os Recursos & Módulos' }}
          </h2>
          <p class="card-subtitle">
            {{
              viewMode === 'top'
                ? 'Funcionalidades mais frequentes no Louvor JA no período'
                : `${activeModulesCount} de ${allModulesList.length} recursos executados pelas congregações`
            }}
          </p>
        </div>

        <!-- Seletor Pill: Mais Usados vs Ver Todos -->
        <div class="view-mode-pills">
          <button
            type="button"
            class="mode-pill-btn"
            :class="{ active: viewMode === 'top' }"
            @click="viewMode = 'top'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Mais Usados</span>
          </button>
          <button
            type="button"
            class="mode-pill-btn"
            :class="{ active: viewMode === 'all' }"
            @click="viewMode = 'all'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-svg">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            </svg>
            <span>Ver Todos ({{ allModulesList.length }})</span>
          </button>
        </div>
      </div>

      <!-- Barra de Filtros quando "Ver Todos" estiver ativo -->
      <div v-if="viewMode === 'all'" class="all-modules-toolbar">
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-svg">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar funcionalidade..."
            class="search-input"
          />
          <button v-if="searchTerm" class="clear-search-btn" @click="searchTerm = ''">✕</button>
        </div>

        <div class="status-filter-pills">
          <button
            type="button"
            class="status-pill"
            :class="{ active: filterStatus === 'all' }"
            @click="filterStatus = 'all'"
          >
            Todos
          </button>
          <button
            type="button"
            class="status-pill"
            :class="{ active: filterStatus === 'active' }"
            @click="filterStatus = 'active'"
          >
            Ativos ({{ activeModulesCount }})
          </button>
          <button
            type="button"
            class="status-pill"
            :class="{ active: filterStatus === 'inactive' }"
            @click="filterStatus = 'inactive'"
          >
            Sem Acessos ({{ inactiveModulesCount }})
          </button>
        </div>
      </div>

      <!-- Estado Vazio -->
      <div v-if="filteredModulesList.length === 0" class="empty-list-note text-muted">
        <div class="empty-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="empty-svg">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </div>
        <p>Nenhum módulo encontrado para o critério selecionado.</p>
      </div>

      <!-- Lista de Barras de Módulos -->
      <div v-else class="bars-list" :class="{ 'scrollable-list': viewMode === 'all' }">
        <div
          v-for="mod in filteredModulesList"
          :key="mod.id || mod.name"
          class="bar-item"
          :class="{ 'item-inactive': mod.count === 0 }"
        >
          <div class="bar-header">
            <div class="mod-identity">
              <span class="mod-icon-box" :style="{ background: getModMeta(mod.name).bg, color: getModMeta(mod.name).color }">
                <span class="mod-svg-wrap" v-html="getModMeta(mod.name).icon"></span>
              </span>
              <div class="mod-name-group">
                <span class="bar-label">{{ mod.name }}</span>
                <span v-if="viewMode === 'all'" class="mod-status-tag" :class="mod.count > 0 ? 'tag-active' : 'tag-inactive'">
                  {{ mod.count > 0 ? `${mod.count} acessos` : 'Sem registros' }}
                </span>
              </div>
            </div>

            <div class="mod-stat-group">
              <span class="bar-value font-mono">
                <strong>{{ mod.count.toLocaleString('pt-BR') }}</strong> acessos
              </span>
              <span class="bar-share font-mono">
                {{ getSharePercentage(mod.count) }}%
              </span>
            </div>
          </div>

          <div class="track">
            <div
              class="fill mod-fill"
              :style="{ width: `${getBarPercentage(mod.count)}%`, background: getModMeta(mod.name).color }"
            />
          </div>
        </div>
      </div>

      <!-- Rodapé do Card de Módulos -->
      <div class="card-footer-action">
        <button
          v-if="viewMode === 'top'"
          type="button"
          class="toggle-link-btn"
          @click="viewMode = 'all'"
        >
          <span>Ver todos os {{ allModulesList.length }} módulos do Louvor JA</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-svg">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button
          v-else
          type="button"
          class="toggle-link-btn"
          @click="viewMode = 'top'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-svg">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>Exibir apenas os mais usados</span>
        </button>
      </div>
    </div>

    <!-- Plataformas e Sistemas -->
    <div class="card-box platforms-card">
      <div class="card-header">
        <h2 class="card-title">Sistemas Operacionais & Plataformas</h2>
        <p class="card-subtitle">Distribuição das congregações por ambiente de execução</p>
      </div>

      <div v-if="!platforms || platforms.length === 0" class="empty-list-note text-muted">
        <div class="empty-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="empty-svg">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <p>Nenhuma plataforma registrada no banco ainda.</p>
      </div>

      <div v-else class="platforms-list">
        <div v-for="plat in platforms" :key="plat.name" class="plat-row">
          <div class="plat-header">
            <div class="plat-identity">
              <span class="plat-icon-box">
                <svg v-if="plat.name.toLowerCase().includes('mac')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="plat-svg">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                  <path d="M12 12L2.5 7.5"/>
                </svg>
                <svg v-else-if="plat.name.toLowerCase().includes('win')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="plat-svg">
                  <rect x="3" y="3" width="8" height="8"/>
                  <rect x="13" y="3" width="8" height="8"/>
                  <rect x="3" y="13" width="8" height="8"/>
                  <rect x="13" y="13" width="8" height="8"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="plat-svg">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </span>
              <span class="plat-name">{{ plat.name }}</span>
            </div>
            <span class="plat-stat font-mono">
              {{ plat.count }} <span class="pct">({{ plat.pct }}%)</span>
            </span>
          </div>
          <div class="track">
            <div
              class="fill plat-fill"
              :style="{ width: `${plat.pct}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface ModuleItem {
  id?: string;
  name: string;
  count: number;
}

const props = withDefaults(
  defineProps<{
    topModules?: ModuleItem[];
    allModules?: ModuleItem[];
    modules?: ModuleItem[];
    platforms?: { name: string; count: number; pct: number }[];
  }>(),
  {
    topModules: () => [],
    allModules: () => [],
    modules: () => [],
    platforms: () => [],
  }
);

// Modo de visualização: 'top' (mais usados) ou 'all' (ver todos os módulos)
const viewMode = ref<"top" | "all">("top");
const searchTerm = ref("");
const filterStatus = ref<"all" | "active" | "inactive">("all");

// Lista consolidada de todos os módulos
const allModulesList = computed(() => {
  if (props.allModules && props.allModules.length > 0) {
    return props.allModules;
  }
  if (props.modules && props.modules.length > 0) {
    return props.modules;
  }
  return [];
});

// Lista dos módulos mais usados (Top 5)
const topModulesList = computed(() => {
  if (props.topModules && props.topModules.length > 0) {
    return props.topModules;
  }
  if (props.modules && props.modules.length > 0) {
    return props.modules.slice(0, 5);
  }
  if (allModulesList.value.length > 0) {
    const active = allModulesList.value.filter((m) => m.count > 0);
    return (active.length > 0 ? active : allModulesList.value).slice(0, 5);
  }
  return [];
});

const activeModulesCount = computed(() => {
  return allModulesList.value.filter((m) => m.count > 0).length;
});

const inactiveModulesCount = computed(() => {
  return allModulesList.value.filter((m) => m.count === 0).length;
});

const totalClicks = computed(() => {
  const sum = allModulesList.value.reduce((acc, m) => acc + (m.count || 0), 0);
  return Math.max(1, sum);
});

// Maior contagem entre os módulos visíveis para escala de barra
const maxCount = computed(() => {
  const current = viewMode.value === "top" ? topModulesList.value : allModulesList.value;
  if (current.length === 0) return 1;
  const max = Math.max(...current.map((m) => m.count || 0));
  return Math.max(1, max);
});

// Lista filtrada final a exibir
const filteredModulesList = computed(() => {
  if (viewMode.value === "top") {
    return topModulesList.value;
  }

  let list = [...allModulesList.value];

  // Filtro por busca
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase().trim();
    list = list.filter((m) => m.name.toLowerCase().includes(term));
  }

  // Filtro por status
  if (filterStatus.value === "active") {
    list = list.filter((m) => m.count > 0);
  } else if (filterStatus.value === "inactive") {
    list = list.filter((m) => m.count === 0);
  }

  return list;
});

function getBarPercentage(count: number): number {
  if (!count || count <= 0) return 0;
  return Math.max(8, Math.round((count / maxCount.value) * 100));
}

function getSharePercentage(count: number): number {
  if (!count || count <= 0) return 0;
  return Math.round((count / totalClicks.value) * 100);
}

// Dicionário de SVGs e cores de módulos padronizados
const defaultModMeta = {
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`,
  bg: "rgba(0, 151, 215, 0.12)",
  color: "#0097d7",
};

const moduleMetaMap: Record<string, { icon: string; bg: string; color: string }> = {
  "Louvor & Coletâneas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    bg: "rgba(2, 132, 199, 0.12)",
    color: "#0284c7",
  },
  "Coletâneas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    bg: "rgba(2, 132, 199, 0.12)",
    color: "#0284c7",
  },
  "Hinário Adventista": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    bg: "rgba(217, 119, 6, 0.12)",
    color: "#d97706",
  },
  "Hinário Adventista (1996)": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M10 2v8l3-2 3 2V2"/></svg>`,
    bg: "rgba(234, 88, 12, 0.12)",
    color: "#ea580c",
  },
  "Bíblia Sagrada": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/><path d="M12 6v6"/><path d="M9.5 8.5h5"/></svg>`,
    bg: "rgba(217, 119, 6, 0.12)",
    color: "#d97706",
  },
  "Liturgia": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`,
    bg: "rgba(124, 58, 237, 0.12)",
    color: "#7c3aed",
  },
  "Cronômetro": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M12 2v3"/><path d="M10 2h4"/></svg>`,
    bg: "rgba(234, 88, 12, 0.12)",
    color: "#ea580c",
  },
  "Relógio": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    bg: "rgba(2, 132, 199, 0.12)",
    color: "#0284c7",
  },
  "Atualização & Sincronização": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
    bg: "rgba(22, 163, 74, 0.12)",
    color: "#16a34a",
  },
  "Configurações": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    bg: "rgba(100, 116, 139, 0.12)",
    color: "#64748b",
  },
  "Vídeos Online": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="15" rx="3"/><polygon points="10 9 15 11.5 10 14"/></svg>`,
    bg: "rgba(220, 38, 38, 0.12)",
    color: "#dc2626",
  },
  "Vídeos Personalizados": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    bg: "rgba(219, 39, 119, 0.12)",
    color: "#db2777",
  },
  "Editor de Música": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    bg: "rgba(79, 70, 229, 0.12)",
    color: "#4f46e5",
  },
  "Sorteio": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/></svg>`,
    bg: "rgba(202, 138, 4, 0.12)",
    color: "#ca8a04",
  },
  "Ajuda e Suporte": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    bg: "rgba(79, 70, 229, 0.12)",
    color: "#4f46e5",
  },
  "Coletâneas Personalizadas": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    bg: "rgba(162, 28, 175, 0.12)",
    color: "#a21caf",
  },
  "Página Inicial": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    bg: "rgba(2, 132, 199, 0.12)",
    color: "#0284c7",
  },
  "Mensagens & Avisos": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    bg: "rgba(2, 132, 199, 0.12)",
    color: "#0284c7",
  },
  "Sistema Principal": {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    bg: "rgba(147, 51, 234, 0.12)",
    color: "#9333ea",
  },
};

function getModMeta(name: string) {
  return moduleMetaMap[name] || defaultModMeta;
}
</script>

<style scoped>
.modules-platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 20px;
}

@media (max-width: 980px) {
  .modules-platforms-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .card-box {
    padding: 16px;
  }
}

.card-box {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.card-header {
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Seletor Pill */
.view-mode-pills {
  display: flex;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 3px;
  gap: 2px;
}

.mode-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-xs);
  transition: all 0.16s ease;
  cursor: pointer;
  border: none;
  background: transparent;
}

.mode-pill-btn:hover {
  color: var(--text-main);
}

.mode-pill-btn.active {
  background: var(--bg-card);
  color: var(--text-main);
  box-shadow: var(--shadow-xs);
}

.pill-svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* Toolbar em Ver Todos */
.all-modules-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-svg {
  position: absolute;
  left: 12px;
  width: 14px;
  height: 14px;
  color: var(--text-light);
}

.search-input {
  width: 100%;
  padding: 7px 32px 7px 34px;
  font-size: 0.78rem;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  outline: none;
  transition: border-color 0.16s;
}

.search-input:focus {
  border-color: var(--primary);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}

.status-filter-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.status-pill {
  padding: 3px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.16s;
}

.status-pill:hover {
  color: var(--text-main);
}

.status-pill.active {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

/* Lista de Módulos */
.bars-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.scrollable-list {
  max-height: 480px;
  overflow-y: auto;
  padding-right: 6px;
}

.scrollable-list::-webkit-scrollbar {
  width: 4px;
}

.scrollable-list::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 99px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: opacity 0.2s;
}

.item-inactive {
  opacity: 0.65;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mod-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mod-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mod-svg-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.mod-svg-wrap svg) {
  width: 14px;
  height: 14px;
}

.mod-name-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bar-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.mod-status-tag {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}

.tag-active {
  background: var(--success-light);
  color: var(--success);
}

.tag-inactive {
  background: var(--bg-card-subtle);
  color: var(--text-light);
}

.mod-stat-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.bar-value {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.bar-value strong {
  color: var(--text-main);
}

.bar-share {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-light);
}

.track {
  width: 100%;
  height: 7px;
  background: var(--track-bg);
  border-radius: 99px;
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.plat-fill {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

/* Rodapé com Ação */
.card-footer-action {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--border-subtle);
  display: flex;
  justify-content: center;
}

.toggle-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.16s ease;
}

.toggle-link-btn:hover {
  background: var(--primary-light);
}

.arrow-svg {
  width: 12px;
  height: 12px;
  transition: transform 0.16s ease;
}

.toggle-link-btn:hover .arrow-svg {
  transform: translateX(2px);
}

/* Plataformas */
.platforms-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plat-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.plat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plat-identity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plat-icon-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-card-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.plat-svg {
  width: 13px;
  height: 13px;
}

.plat-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.plat-stat {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.pct {
  color: var(--primary);
  font-weight: 700;
}

/* Estado Vazio */
.empty-list-note {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-icon-box {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-card-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.empty-svg {
  width: 20px;
  height: 20px;
}
</style>
