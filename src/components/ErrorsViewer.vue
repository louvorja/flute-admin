<template>
  <div class="errors-viewer-container card-box">
    <!-- 1. Cabeçalho Principal -->
    <div class="errors-header-row">
      <div class="header-info-group">
        <div class="title-status-line">
          <h2 class="card-title">Rastreador de Falhas & Erros em Tempo Real</h2>
          <span
            class="badge-error-status font-mono"
            :class="pendingOccurrences > 0 ? 'status-has-errors' : 'status-healthy'"
          >
            {{
              pendingOccurrences > 0
                ? `${pendingOccurrences} Falhas Pendentes (${pendingGroupsCount} ${pendingGroupsCount === 1 ? 'tipo' : 'tipos'})`
                : '0 Falhas Pendentes • Estável'
            }}
          </span>
        </div>
        <p class="card-subtitle">
          Exceções capturadas automaticamente nos dispositivos dos operadores. Erros idênticos são agrupados para facilitar a análise.
        </p>
      </div>

      <!-- Ações do Topo -->
      <div class="header-actions">
        <button
          v-if="pendingOccurrences > 0"
          type="button"
          class="btn-mark-all"
          title="Marcar todas as falhas atuais como vistas e zerar o contador do menu"
          @click="markAllAsSeen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-svg">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Marcar Todos como Vistos (Zerar Contador)</span>
        </button>

        <button
          v-else-if="totalOccurrences > 0"
          type="button"
          class="btn-reopen-all"
          title="Reabrir todas as falhas e restaurar o contador"
          @click="resetClearedState"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-svg">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          <span>Reabrir Alertas</span>
        </button>
      </div>
    </div>

    <!-- 2. Toast de Feedback -->
    <div v-if="toastMessage" class="feedback-toast" :class="toastType">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-svg">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- 3. Toolbar: Busca, Filtros e Ordenação -->
    <div class="errors-toolbar-row">
      <!-- Campo de Busca -->
      <div class="search-input-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-svg">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por mensagem de erro, função ou arquivo..."
          class="search-input"
        />
        <button v-if="searchQuery" type="button" class="clear-search-btn" @click="searchQuery = ''">✕</button>
      </div>

      <!-- Filtro de Status -->
      <div class="filter-pill-group">
        <button
          type="button"
          class="filter-pill"
          :class="{ active: statusFilter === 'pending' }"
          @click="statusFilter = 'pending'"
        >
          Pendentes ({{ pendingGroupsCount }})
        </button>
        <button
          type="button"
          class="filter-pill"
          :class="{ active: statusFilter === 'all' }"
          @click="statusFilter = 'all'"
        >
          Todos ({{ allGroups.length }})
        </button>
        <button
          type="button"
          class="filter-pill"
          :class="{ active: statusFilter === 'seen' }"
          @click="statusFilter = 'seen'"
        >
          Vistos ({{ seenGroupsCount }})
        </button>
      </div>

      <!-- Ordenação -->
      <select v-model="sortBy" class="sort-select">
        <option value="count">Mais Frequentes (Volume)</option>
        <option value="recent">Mais Recentes</option>
      </select>
    </div>

    <!-- 4. Estado Vazio -->
    <div v-if="filteredGroups.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="shield-svg">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <h4>
        {{
          statusFilter === 'pending' && totalOccurrences > 0
            ? 'Todas as falhas foram vistas e resolvidas!'
            : 'Nenhuma falha encontrada'
        }}
      </h4>
      <p v-if="statusFilter === 'pending' && totalOccurrences > 0">
        As {{ totalOccurrences }} ocorrências anteriores foram marcadas como vistas e o contador foi zerado. Novos erros capturados aparecerão aqui automaticamente.
      </p>
      <p v-else-if="searchQuery">
        Nenhum erro corresponde ao termo "{{ searchQuery }}". Tente ajustar a busca.
      </p>
      <p v-else>
        Todos os sistemas operando normalmente! Nenhuma exceção não tratada foi transmitida recentemente.
      </p>

      <button
        v-if="statusFilter === 'pending' && totalOccurrences > 0"
        type="button"
        class="btn-view-archived"
        @click="statusFilter = 'all'"
      >
        Ver histórico de falhas arquivadas ({{ allGroups.length }})
      </button>
    </div>

    <!-- 5. Lista de Erros Agrupados -->
    <div v-else class="grouped-errors-list">
      <div
        v-for="group in filteredGroups"
        :key="group.key"
        class="error-group-card"
        :class="{ 'group-seen': group.isSeen }"
      >
        <!-- Linha Resumo do Erro -->
        <div class="group-main-row" @click="toggleExpand(group.key)">
          <!-- Coluna 1: Contagem e Mensagem -->
          <div class="group-identity">
            <span
              class="occurrence-pill font-mono"
              :class="group.count > 10 ? 'pill-high-freq' : 'pill-normal-freq'"
              :title="`${group.count} ocorrências deste erro`"
            >
              {{ group.count }}x
            </span>

            <div class="message-container">
              <span class="error-msg-text font-mono">{{ group.message }}</span>
              <div class="tags-meta-row font-mono">
                <!-- Versões -->
                <span v-for="ver in group.versions" :key="ver" class="meta-tag tag-version">
                  v{{ ver }}
                </span>

                <!-- Plataformas -->
                <span v-for="plat in group.platforms" :key="plat" class="meta-tag tag-platform">
                  {{ plat }}
                </span>

                <!-- Horário mais recente -->
                <span class="meta-time">
                  Última ocorrência: {{ formatDate(group.lastSeen) }}
                </span>

                <span v-if="group.count > 1" class="meta-first-time">
                  (Primeira: {{ formatDate(group.firstSeen) }})
                </span>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Status e Ações Rápidas -->
          <div class="group-action-col" @click.stop>
            <span class="status-pill font-mono" :class="group.isSeen ? 'pill-seen' : 'pill-pending'">
              {{ group.isSeen ? 'Visto' : 'Pendente' }}
            </span>

            <!-- Botão Marcar como Visto Individual -->
            <button
              type="button"
              class="btn-toggle-seen"
              :title="group.isSeen ? 'Reabrir erro como pendente' : 'Marcar como visto'"
              @click="toggleGroupSeen(group)"
            >
              <svg v-if="!group.isSeen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="seen-svg">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="seen-svg">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              <span>{{ group.isSeen ? 'Reabrir' : 'Marcar Visto' }}</span>
            </button>

            <!-- Botão Expandir Detalhes -->
            <button
              type="button"
              class="btn-expand"
              :class="{ rotated: isExpanded(group.key) }"
              :title="isExpanded(group.key) ? 'Recolher detalhes' : 'Ver stack trace e detalhes'"
              @click.stop="toggleExpand(group.key)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron-svg">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Linha Expandida: Stack Trace & Detalhes -->
        <div v-if="isExpanded(group.key)" class="group-expanded-details">
          <div class="details-section">
            <div class="details-head">
              <span class="details-label font-mono">STACK TRACE / DETALHES TÉCNICOS:</span>
              <button
                type="button"
                class="btn-copy"
                @click="copyToClipboard(group.details || group.message)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="copy-svg">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                <span>Copiar</span>
              </button>
            </div>

            <pre class="code-trace-box font-mono"><code>{{ group.details || group.message }}</code></pre>
          </div>

          <!-- Histórico das últimas ocorrências -->
          <div class="recent-events-sublist">
            <span class="details-label font-mono">ÚLTIMAS OCORRÊNCIAS REGISTRADAS ({{ group.items.length }}):</span>
            <div class="events-timeline">
              <div
                v-for="item in group.items.slice(0, 10)"
                :key="item.id"
                class="timeline-item font-mono"
              >
                <span class="tl-dot"></span>
                <span class="tl-date">{{ formatDate(item.created_at) }}</span>
                <span class="tl-meta">{{ item.version }} • {{ item.platform }}</span>
              </div>
              <span v-if="group.items.length > 10" class="more-hint font-mono">
                + {{ group.items.length - 10 }} ocorrências anteriores agrupadas neste erro.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

export interface TelemetryErrorItem {
  id: number;
  message: string;
  details?: string;
  version: string;
  platform: string;
  created_at: string;
}

export interface GroupedError {
  key: string;
  message: string;
  details?: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  versions: string[];
  platforms: string[];
  items: TelemetryErrorItem[];
  isSeen: boolean;
  isExpanded: boolean;
}

const props = defineProps<{
  errors: TelemetryErrorItem[];
}>();

const emit = defineEmits<{
  (e: "update-unseen-count", count: number): void;
}>();

const STORAGE_CLEARED_AT = "lja_errors_cleared_at";
const STORAGE_SEEN_KEYS = "lja_seen_error_keys";

const clearedAt = ref<string | null>(localStorage.getItem(STORAGE_CLEARED_AT));
const seenKeys = ref<Set<string>>(new Set(loadSeenKeys()));
const expandedKeys = ref<Set<string>>(new Set());

const searchQuery = ref("");
const statusFilter = ref<"pending" | "all" | "seen">("pending");
const sortBy = ref<"count" | "recent">("count");

const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");

function loadSeenKeys(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SEEN_KEYS) || "[]");
  } catch {
    return [];
  }
}

function saveSeenKeys() {
  localStorage.setItem(STORAGE_SEEN_KEYS, JSON.stringify(Array.from(seenKeys.value)));
}

function showToast(msg: string, type: "success" | "error" = "success") {
  toastMessage.value = msg;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = "";
  }, 4000);
}

// Agrupamento de todos os erros
const allGroups = computed<GroupedError[]>(() => {
  const map = new Map<string, GroupedError>();
  const raw = props.errors || [];

  for (const err of raw) {
    const rawMsg = err.message || "Erro desconhecido";
    const key = rawMsg.trim();

    if (!map.has(key)) {
      map.set(key, {
        key,
        message: rawMsg,
        details: err.details || "",
        count: 0,
        firstSeen: err.created_at,
        lastSeen: err.created_at,
        versions: [],
        platforms: [],
        items: [],
        isSeen: false,
        isExpanded: false,
      });
    }

    const g = map.get(key)!;
    g.count++;
    g.items.push(err);
    if (!g.details && err.details) {
      g.details = err.details;
    }

    if (new Date(err.created_at) > new Date(g.lastSeen)) {
      g.lastSeen = err.created_at;
    }
    if (new Date(err.created_at) < new Date(g.firstSeen)) {
      g.firstSeen = err.created_at;
    }

    if (err.version && !g.versions.includes(err.version)) {
      g.versions.push(err.version);
    }
    if (err.platform && !g.platforms.includes(err.platform)) {
      g.platforms.push(err.platform);
    }
  }

  // Verifica status de visto para cada grupo
  for (const g of map.values()) {
    const isExplicitlySeen = seenKeys.value.has(g.key);
    const isBeforeCleared = clearedAt.value ? new Date(g.lastSeen) <= new Date(clearedAt.value) : false;
    g.isSeen = isExplicitlySeen || isBeforeCleared;
  }

  return Array.from(map.values());
});

const totalOccurrences = computed(() => {
  return props.errors ? props.errors.length : 0;
});

const pendingGroupsCount = computed(() => {
  return allGroups.value.filter((g) => !g.isSeen).length;
});

const seenGroupsCount = computed(() => {
  return allGroups.value.filter((g) => g.isSeen).length;
});

const pendingOccurrences = computed(() => {
  return allGroups.value
    .filter((g) => !g.isSeen)
    .reduce((acc, g) => acc + g.count, 0);
});

// Emite para a Sidebar o número de ocorrências pendentes
watch(
  pendingOccurrences,
  (val) => {
    emit("update-unseen-count", val);
  },
  { immediate: true }
);

// Lista filtrada e ordenada
const filteredGroups = computed(() => {
  let list = [...allGroups.value];

  // Filtro de status
  if (statusFilter.value === "pending") {
    list = list.filter((g) => !g.isSeen);
  } else if (statusFilter.value === "seen") {
    list = list.filter((g) => g.isSeen);
  }

  // Filtro de busca
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (g) =>
        g.message.toLowerCase().includes(q) ||
        (g.details && g.details.toLowerCase().includes(q))
    );
  }

  // Ordenação
  if (sortBy.value === "count") {
    list.sort((a, b) => b.count - a.count);
  } else {
    list.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
  }

  return list;
});

function markAllAsSeen() {
  const nowIso = new Date().toISOString();
  clearedAt.value = nowIso;
  localStorage.setItem(STORAGE_CLEARED_AT, nowIso);

  // Também adiciona todas as chaves atuais
  for (const g of allGroups.value) {
    seenKeys.value.add(g.key);
  }
  saveSeenKeys();

  emit("update-unseen-count", 0);
  showToast("Todas as falhas foram marcadas como vistas! O contador foi zerado.");
}

function resetClearedState() {
  clearedAt.value = null;
  localStorage.removeItem(STORAGE_CLEARED_AT);
  seenKeys.value.clear();
  saveSeenKeys();

  emit("update-unseen-count", totalOccurrences.value);
  statusFilter.value = "pending";
  showToast("Alertas reabertos com sucesso.");
}

function toggleGroupSeen(group: GroupedError) {
  if (group.isSeen) {
    seenKeys.value.delete(group.key);
    group.isSeen = false;
    showToast("Falha reaberta como pendente.");
  } else {
    seenKeys.value.add(group.key);
    group.isSeen = true;
    showToast("Falha marcada como vista!");
  }
  saveSeenKeys();
  emit("update-unseen-count", pendingOccurrences.value);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Stack trace copiado para a área de transferência!");
  } catch {
    showToast("Erro ao copiar texto.", "error");
  }
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function toggleExpand(key: string) {
  const next = new Set(expandedKeys.value);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  expandedKeys.value = next;
}

function isExpanded(key: string): boolean {
  return expandedKeys.value.has(key);
}

onMounted(() => {
  emit("update-unseen-count", pendingOccurrences.value);
});
</script>

<style scoped>
.errors-viewer-container {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 1. Header */
.errors-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.header-info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-status-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin: 0;
}

.badge-error-status {
  font-size: 0.74rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.status-has-errors {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.status-healthy {
  background: var(--success-light);
  color: var(--success);
}

.card-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  max-width: 680px;
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-mark-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--success);
  color: #fff;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.16s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
}

.btn-mark-all:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-reopen-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-card-subtle);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-reopen-all:hover {
  color: var(--text-main);
  border-color: var(--border-color);
}

.btn-svg {
  width: 15px;
  height: 15px;
}

/* 2. Feedback Toast */
.feedback-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  font-weight: 600;
  animation: fadeIn 0.2s ease;
}

.feedback-toast.success {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.feedback-toast.error {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.toast-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 3. Toolbar */
.errors-toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 260px;
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
  padding: 8px 32px 8px 34px;
  font-size: 0.8rem;
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
  cursor: pointer;
  font-size: 0.8rem;
}

.filter-pill-group {
  display: flex;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 3px;
  gap: 2px;
}

.filter-pill {
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

.filter-pill.active {
  background: var(--bg-card);
  color: var(--text-main);
  box-shadow: var(--shadow-xs);
}

.sort-select {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
}

/* 4. Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 56px 20px;
  background: var(--bg-card-subtle);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-light);
}

.empty-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--success-light);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.shield-svg {
  width: 26px;
  height: 26px;
}

.empty-state h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.empty-state p {
  font-size: 0.82rem;
  color: var(--text-muted);
  max-width: 500px;
  line-height: 1.5;
  margin: 0;
}

.btn-view-archived {
  margin-top: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  border: none;
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: filter 0.16s;
}

.btn-view-archived:hover {
  filter: brightness(1.1);
}

/* 5. Grouped Errors List */
.grouped-errors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-group-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-card-subtle);
  transition: all 0.2s ease;
  overflow: hidden;
}

.error-group-card:hover {
  border-color: var(--border-color);
  background: var(--bg-card);
}

.group-seen {
  opacity: 0.65;
  border-style: dashed;
}

.group-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  cursor: pointer;
  gap: 16px;
  flex-wrap: wrap;
}

.group-identity {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 280px;
}

.occurrence-pill {
  font-size: 0.78rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  margin-top: 2px;
}

.pill-high-freq {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.pill-normal-freq {
  background: var(--warning-light);
  color: var(--warning);
}

.message-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.error-msg-text {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--danger);
  word-break: break-all;
  line-height: 1.4;
}

.group-seen .error-msg-text {
  color: var(--text-secondary);
}

.tags-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.meta-tag {
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 600;
}

.tag-version {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  color: var(--text-main);
}

.tag-platform {
  background: var(--primary-light);
  color: var(--primary);
}

.meta-time {
  color: var(--text-muted);
}

.meta-first-time {
  color: var(--text-light);
}

/* Ações por Grupo */
.group-action-col {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-full);
}

.pill-pending {
  background: var(--warning-light);
  color: var(--warning);
}

.pill-seen {
  background: var(--success-light);
  color: var(--success);
}

.btn-toggle-seen {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-toggle-seen:hover {
  color: var(--text-main);
  border-color: var(--primary);
}

.seen-svg {
  width: 13px;
  height: 13px;
}

.btn-expand {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-expand:hover {
  color: var(--text-main);
  border-color: var(--border-color);
}

.chevron-svg {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.btn-expand.rotated .chevron-svg {
  transform: rotate(180deg);
}

/* Detalhes Expandidos */
.group-expanded-details {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-card);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.2s ease;
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.details-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.05em;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  border: none;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: filter 0.16s;
}

.btn-copy:hover {
  filter: brightness(1.1);
}

.copy-svg {
  width: 12px;
  height: 12px;
}

.code-trace-box {
  background: #0f172a;
  color: #f8fafc;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  line-height: 1.5;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.recent-events-sublist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.events-timeline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 4px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.tl-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
  flex-shrink: 0;
}

.tl-date {
  color: var(--text-main);
  font-weight: 600;
}

.more-hint {
  font-size: 0.7rem;
  color: var(--text-light);
  margin-top: 4px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 980px) {
  .errors-viewer-container {
    padding: 16px;
    gap: 16px;
  }

  .errors-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-mark-all,
  .btn-reopen-all {
    width: 100%;
    justify-content: center;
  }

  .errors-toolbar-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-input-wrap {
    width: 100%;
  }

  .filter-pill-group {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .sort-select {
    width: 100%;
  }

  .group-main-row {
    padding: 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .group-identity {
    width: 100%;
    min-width: 0;
  }

  .group-action-col {
    width: 100%;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--border-subtle);
  }

  .group-expanded-details {
    padding: 14px;
  }
}
</style>
