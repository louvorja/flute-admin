<template>
  <div class="support-view-container">
    <!-- Cabeçalho da Central de Suporte -->
    <div class="support-header card-box">
      <div class="header-content">
        <div class="header-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div>
          <h2 class="header-title">Central de Chamados & Suporte</h2>
          <p class="header-subtitle">
            Dúvidas, sugestões e relatórios de problemas enviados diretamente pelos operadores do Louvor JA
          </p>
        </div>
      </div>

      <div class="header-actions">
        <button class="refresh-btn" :disabled="loading" @click="fetchTickets">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>Atualizar</span>
        </button>
      </div>
    </div>

    <!-- Cards de Métricas / KPIs -->
    <div class="kpis-grid">
      <div class="kpi-card card-box" :class="{ 'has-open': stats.open > 0 }">
        <div class="kpi-icon-wrap open-color">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Chamados Abertos</span>
          <span class="kpi-value open-text">{{ stats.open }}</span>
        </div>
      </div>

      <div class="kpi-card card-box">
        <div class="kpi-icon-wrap in-progress-color">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Em Atendimento</span>
          <span class="kpi-value in-progress-text">{{ stats.inProgress }}</span>
        </div>
      </div>

      <div class="kpi-card card-box">
        <div class="kpi-icon-wrap resolved-color">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Resolvidos / Fechados</span>
          <span class="kpi-value resolved-text">{{ stats.resolved + stats.closed }}</span>
        </div>
      </div>

      <div class="kpi-card card-box">
        <div class="kpi-icon-wrap total-color">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div class="kpi-info">
          <span class="kpi-label">Total de Solicitações</span>
          <span class="kpi-value">{{ stats.total }}</span>
        </div>
      </div>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="filters-card card-box">
      <div class="search-input-wrap">
        <svg viewBox="0 0 24 24" class="search-svg" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por assunto, mensagem, solicitante ou e-mail..."
          class="filter-search-input"
        />
        <button v-if="search" class="clear-btn" @click="search = ''">✕</button>
      </div>

      <!-- Filtro de Status -->
      <div class="filter-group">
        <span class="filter-title">Status:</span>
        <div class="pills-row">
          <button
            class="filter-pill"
            :class="{ active: selectedStatus === 'all' }"
            @click="selectedStatus = 'all'"
          >
            Todos ({{ stats.total }})
          </button>
          <button
            class="filter-pill pill-open"
            :class="{ active: selectedStatus === 'open' }"
            @click="selectedStatus = 'open'"
          >
            Abertos ({{ stats.open }})
          </button>
          <button
            class="filter-pill pill-prog"
            :class="{ active: selectedStatus === 'in_progress' }"
            @click="selectedStatus = 'in_progress'"
          >
            Em Atendimento ({{ stats.inProgress }})
          </button>
          <button
            class="filter-pill pill-done"
            :class="{ active: selectedStatus === 'resolved' }"
            @click="selectedStatus = 'resolved'"
          >
            Resolvidos ({{ stats.resolved }})
          </button>
        </div>
      </div>

      <!-- Filtro de Categoria -->
      <div class="filter-group">
        <span class="filter-title">Categoria:</span>
        <select v-model="selectedCategory" class="filter-select">
          <option value="all">Todas as Categorias</option>
          <option value="doubt">Dúvidas</option>
          <option value="suggestion">Sugestões</option>
          <option value="bug">Problemas & Bugs</option>
          <option value="other">Outros</option>
        </select>
      </div>
    </div>

    <!-- Mensagem de Feedback de Ação (Toast) -->
    <div v-if="feedbackMsg" class="feedback-toast" :class="feedbackType">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>{{ feedbackMsg }}</span>
    </div>

    <!-- Lista / Tabela de Chamados -->
    <div class="tickets-list-card card-box">
      <!-- Loading State -->
      <div v-if="loading && tickets.length === 0" class="loading-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading-icon spinning">
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
        <p>Carregando chamados de suporte do Supabase...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTickets.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="inbox-svg">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
          </svg>
        </div>
        <h4>Nenhum chamado encontrado</h4>
        <p v-if="search || selectedStatus !== 'all' || selectedCategory !== 'all'">
          Tente ajustar os filtros ou os termos de busca acima.
        </p>
        <p v-else>
          Nenhuma solicitação de suporte foi registrada até o momento.
        </p>
      </div>

      <!-- Lista de Chamados -->
      <div v-else class="tickets-accordion">
        <div
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          class="ticket-item"
          :class="{
            expanded: expandedTicketId === ticket.id,
            'is-open': ticket.status === 'open',
            'is-in-progress': ticket.status === 'in_progress',
            'is-resolved': ticket.status === 'resolved' || ticket.status === 'closed'
          }"
        >
          <!-- Cabeçalho do Chamado (Linha Resumo) -->
          <div class="ticket-header-row" @click="toggleExpand(ticket.id)">
            <!-- Status Badge & Categoria -->
            <div class="badges-col">
              <span class="status-badge" :class="ticket.status">
                {{ getStatusLabel(ticket.status) }}
              </span>
              <span class="category-badge" :class="ticket.category">
                {{ getCategoryLabel(ticket.category) }}
              </span>
            </div>

            <!-- Assunto & Solicitante -->
            <div class="subject-col">
              <div class="subject-title">
                <span class="ticket-id font-mono">#{{ ticket.id }}</span>
                <span class="subject-text">{{ ticket.subject }}</span>
              </div>
              <div class="requester-sub">
                <span class="requester-name">{{ ticket.name }}</span>
                <span class="dot-separator">•</span>
                <span class="requester-email font-mono">{{ ticket.email }}</span>
                <span class="dot-separator">•</span>
                <span class="env-tag font-mono">{{ ticket.platform || 'App' }} (v{{ ticket.app_version || '1.0' }})</span>
              </div>
            </div>

            <!-- Data & Ações Rápidas -->
            <div class="date-col">
              <span class="date-text font-mono">{{ formatDate(ticket.created_at) }}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="chevron-icon"
                :class="{ rotated: expandedTicketId === ticket.id }"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          <!-- Conteúdo Expandido do Chamado -->
          <div v-if="expandedTicketId === ticket.id" class="ticket-expanded-body">
            <!-- Mensagem enviada pelo operador -->
            <div class="msg-box">
              <div class="msg-box-header">
                <span class="box-title">Mensagem do Solicitante</span>
                <a
                  :href="getMailtoLink(ticket)"
                  class="reply-email-btn"
                  target="_blank"
                  rel="noopener"
                  title="Responder diretamente por e-mail"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Responder por E-mail</span>
                </a>
              </div>
              <div class="msg-content">
                {{ ticket.message }}
              </div>
            </div>

            <!-- Painel de Ações de Gestão & Diagnóstico -->
            <div class="ticket-management-grid">
              <!-- Bloco de Alteração de Status & Notas Internas -->
              <div class="admin-action-box">
                <div class="action-box-title">Gestão do Chamado</div>

                <!-- Seletor de Status -->
                <div class="form-row">
                  <label class="form-label">Status do Atendimento:</label>
                  <div class="status-buttons-row">
                    <button
                      class="status-choice-btn"
                      :class="{ selected: ticket.status === 'open' }"
                      @click="changeStatus(ticket, 'open')"
                    >
                      Aberto
                    </button>
                    <button
                      class="status-choice-btn"
                      :class="{ selected: ticket.status === 'in_progress' }"
                      @click="changeStatus(ticket, 'in_progress')"
                    >
                      Em Atendimento
                    </button>
                    <button
                      class="status-choice-btn"
                      :class="{ selected: ticket.status === 'resolved' }"
                      @click="changeStatus(ticket, 'resolved')"
                    >
                      Resolvido
                    </button>
                    <button
                      class="status-choice-btn"
                      :class="{ selected: ticket.status === 'closed' }"
                      @click="changeStatus(ticket, 'closed')"
                    >
                      Fechado
                    </button>
                  </div>
                </div>

                <!-- Anotações Internas do Admin -->
                <div class="form-row" style="margin-top: 14px;">
                  <div class="label-with-hint">
                    <label class="form-label">Notas Internas do Administrador:</label>
                    <span class="hint-text">Visível apenas para a equipe administrativa</span>
                  </div>
                  <textarea
                    v-model="notesDraft[ticket.id]"
                    rows="3"
                    class="admin-notes-textarea font-mono"
                    placeholder="Adicione observações sobre a solução, orientações fornecidas ou histórico..."
                  ></textarea>
                  <div class="notes-actions">
                    <button
                      class="save-notes-btn"
                      :disabled="savingNotes[ticket.id]"
                      @click="saveNotes(ticket)"
                    >
                      <svg v-if="savingNotes[ticket.id]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning save-icon">
                        <line x1="12" y1="2" x2="12" y2="6"/>
                        <line x1="12" y1="18" x2="12" y2="22"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="save-icon">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      <span>Salvar Anotações</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Bloco de Diagnóstico Técnico Coletado -->
              <div class="diagnostics-box">
                <div class="diag-header">
                  <span class="box-title">Diagnóstico do Dispositivo</span>
                  <span class="badge-tech font-mono">Telemetria do App</span>
                </div>

                <div class="diag-details-list font-mono">
                  <div class="diag-item">
                    <span class="diag-key">Versão do Louvor JA:</span>
                    <span class="diag-val">{{ ticket.diagnostics?.appVersion || ticket.app_version || 'N/A' }}</span>
                  </div>
                  <div class="diag-item">
                    <span class="diag-key">Sistema Operacional:</span>
                    <span class="diag-val">{{ ticket.diagnostics?.platform || ticket.platform || 'N/A' }}</span>
                  </div>
                  <div class="diag-item">
                    <span class="diag-key">Resolução de Tela:</span>
                    <span class="diag-val">{{ ticket.diagnostics?.screenResolution || 'N/A' }}</span>
                  </div>
                  <div class="diag-item">
                    <span class="diag-key">Versão do Banco Local:</span>
                    <span class="diag-val">{{ ticket.diagnostics?.databaseVersion || 'N/A' }}</span>
                  </div>
                  <div class="diag-item">
                    <span class="diag-key">Ambiente Electron:</span>
                    <span class="diag-val">{{ ticket.diagnostics?.isElectron ? 'Sim (Desktop)' : 'Navegador Web' }}</span>
                  </div>
                  <div class="diag-item">
                    <span class="diag-key">ID da Instalação:</span>
                    <span class="diag-val ellipsis-id" :title="ticket.installation_id || 'N/A'">
                      {{ ticket.installation_id ? ticket.installation_id.slice(0, 16) + '...' : 'Anônimo' }}
                    </span>
                  </div>
                  <div class="diag-item">
                    <span class="diag-key">Data do Envio:</span>
                    <span class="diag-val">{{ formatFullDate(ticket.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import {
  getSupportTickets,
  updateTicketStatus,
  SupportTicket,
} from "../services/supabase";

const emit = defineEmits<{
  (e: "update-open-count", count: number): void;
}>();

const tickets = ref<SupportTicket[]>([]);
const loading = ref(false);
const search = ref("");
const selectedStatus = ref<string>("all");
const selectedCategory = ref<string>("all");
const expandedTicketId = ref<number | null>(null);

const notesDraft = reactive<Record<number, string>>({});
const savingNotes = reactive<Record<number, boolean>>({});

const feedbackMsg = ref("");
const feedbackType = ref<"success" | "error">("success");

function showToast(msg: string, type: "success" | "error" = "success") {
  feedbackMsg.value = msg;
  feedbackType.value = type;
  setTimeout(() => {
    feedbackMsg.value = "";
  }, 3500);
}

async function fetchTickets() {
  loading.value = true;
  try {
    const data = await getSupportTickets();
    tickets.value = data;

    // Inicializa os drafts das notas de cada ticket
    for (const t of data) {
      if (notesDraft[t.id] === undefined) {
        notesDraft[t.id] = t.admin_notes || "";
      }
    }

    emit("update-open-count", stats.value.open);
  } catch (err) {
    console.error("Erro ao carregar tickets de suporte:", err);
    showToast("Falha ao carregar chamados do banco de dados", "error");
  } finally {
    loading.value = false;
  }
}

const stats = computed(() => {
  let open = 0;
  let inProgress = 0;
  let resolved = 0;
  let closed = 0;

  for (const t of tickets.value) {
    if (t.status === "open") open++;
    else if (t.status === "in_progress") inProgress++;
    else if (t.status === "resolved") resolved++;
    else if (t.status === "closed") closed++;
  }

  return {
    total: tickets.value.length,
    open,
    inProgress,
    resolved,
    closed,
  };
});

const filteredTickets = computed(() => {
  return tickets.value.filter((t) => {
    // Filtro por Status
    if (selectedStatus.value !== "all" && t.status !== selectedStatus.value) {
      return false;
    }

    // Filtro por Categoria
    if (selectedCategory.value !== "all" && t.category !== selectedCategory.value) {
      return false;
    }

    // Busca Textual
    if (search.value.trim()) {
      const q = search.value.toLowerCase();
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchMessage = t.message?.toLowerCase().includes(q);
      const matchName = t.name?.toLowerCase().includes(q);
      const matchEmail = t.email?.toLowerCase().includes(q);
      const matchVersion = t.app_version?.toLowerCase().includes(q);
      const matchPlatform = t.platform?.toLowerCase().includes(q);

      if (!matchSubject && !matchMessage && !matchName && !matchEmail && !matchVersion && !matchPlatform) {
        return false;
      }
    }

    return true;
  });
});

function toggleExpand(id: number) {
  if (expandedTicketId.value === id) {
    expandedTicketId.value = null;
  } else {
    expandedTicketId.value = id;
    if (notesDraft[id] === undefined) {
      const t = tickets.value.find((x) => x.id === id);
      notesDraft[id] = t?.admin_notes || "";
    }
  }
}

async function changeStatus(
  ticket: SupportTicket,
  newStatus: "open" | "in_progress" | "resolved" | "closed"
) {
  if (ticket.status === newStatus) return;
  const previousStatus = ticket.status;
  ticket.status = newStatus;

  const success = await updateTicketStatus(ticket.id, newStatus);
  if (success) {
    showToast(`Status do chamado #${ticket.id} alterado para "${getStatusLabel(newStatus)}"`);
    emit("update-open-count", stats.value.open);
  } else {
    ticket.status = previousStatus;
    showToast("Erro ao atualizar status do chamado no Supabase", "error");
  }
}

async function saveNotes(ticket: SupportTicket) {
  const note = notesDraft[ticket.id] ?? "";
  savingNotes[ticket.id] = true;

  try {
    const success = await updateTicketStatus(ticket.id, ticket.status, note);
    if (success) {
      ticket.admin_notes = note;
      showToast(`Notas do chamado #${ticket.id} salvas com sucesso!`);
    } else {
      showToast("Falha ao salvar notas no banco", "error");
    }
  } finally {
    savingNotes[ticket.id] = false;
  }
}

function getMailtoLink(ticket: SupportTicket): string {
  const subject = encodeURIComponent(`Re: [Louvor JA - Suporte #${ticket.id}] ${ticket.subject}`);
  const body = encodeURIComponent(
    `Olá, ${ticket.name}!\n\n` +
    `Recebemos sua mensagem enviada através do Louvor JA:\n` +
    `"${ticket.message}"\n\n` +
    `--\nAtenciosamente,\nEquipe Louvor JA`
  );
  return `mailto:${ticket.email}?subject=${subject}&body=${body}`;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Aberto";
    case "in_progress":
      return "Em Atendimento";
    case "resolved":
      return "Resolvido";
    case "closed":
      return "Fechado";
    default:
      return status;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "doubt":
      return "Dúvida";
    case "suggestion":
      return "Sugestão";
    case "bug":
      return "Problema / Bug";
    case "other":
      return "Outro";
    default:
      return category;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

onMounted(() => {
  fetchTickets();
});
</script>

<style scoped>
.support-view-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.25s ease-out;
}

/* Header */
.support-header {
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 151, 215, 0.12);
  color: #0097d7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon-box svg {
  width: 26px;
  height: 26px;
}

.header-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 0.88rem;
  color: var(--text-light);
  margin: 0;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-main);
  font-size: 0.86rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #0097d7;
  color: #0097d7;
}

.refresh-btn svg {
  width: 16px;
  height: 16px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* KPIs */
.kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s;
}

.kpi-card.has-open {
  border-left: 3px solid #f59e0b;
}

.kpi-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-wrap svg {
  width: 22px;
  height: 22px;
}

.open-color {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.open-text {
  color: #f59e0b;
}

.in-progress-color {
  background: rgba(0, 151, 215, 0.14);
  color: #0097d7;
}

.in-progress-text {
  color: #0097d7;
}

.resolved-color {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.resolved-text {
  color: #10b981;
}

.total-color {
  background: rgba(139, 92, 246, 0.14);
  color: #8b5cf6;
}

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
  font-weight: 600;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

/* Filtros */
.filters-card {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.search-input-wrap {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0 14px;
  height: 40px;
  transition: border-color 0.2s;
}

.search-input-wrap:focus-within {
  border-color: #0097d7;
}

.search-svg {
  width: 17px;
  height: 17px;
  color: var(--text-light);
  flex-shrink: 0;
}

.filter-search-input {
  border: none;
  background: transparent;
  width: 100%;
  color: var(--text-main);
  font-size: 0.88rem;
  outline: none;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  font-size: 0.85rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
}

.pills-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-pill {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-light);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-pill:hover {
  color: var(--text-main);
  border-color: var(--text-light);
}

.filter-pill.active {
  background: #0097d7;
  color: #ffffff;
  border-color: #0097d7;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

/* Toast Feedback */
.feedback-toast {
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideDown 0.2s ease-out;
}

.feedback-toast.success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.feedback-toast.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Accordion de Chamados */
.tickets-list-card {
  padding: 0;
  overflow: hidden;
}

.tickets-accordion {
  display: flex;
  flex-direction: column;
}

.ticket-item {
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s;
}

.ticket-item:last-child {
  border-bottom: none;
}

.ticket-header-row {
  padding: 18px 24px;
  display: grid;
  grid-template-columns: 210px 1fr 180px;
  align-items: center;
  gap: 18px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.ticket-header-row:hover {
  background: var(--bg-card-hover);
}

.ticket-item.expanded .ticket-header-row {
  background: var(--bg-card-hover);
  border-bottom: 1px solid var(--border-light);
}

/* Badges */
.badges-col {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 5px;
}

.status-badge.open {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.in_progress {
  background: rgba(0, 151, 215, 0.14);
  color: #0097d7;
  border: 1px solid rgba(0, 151, 215, 0.3);
}

.status-badge.resolved {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.closed {
  background: rgba(156, 163, 175, 0.14);
  color: #9ca3af;
  border: 1px solid rgba(156, 163, 175, 0.3);
}

.category-badge {
  font-size: 0.72rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 5px;
  background: var(--bg-card-subtle);
  color: var(--text-light);
  border: 1px solid var(--border-light);
}

.category-badge.bug {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.category-badge.suggestion {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.category-badge.doubt {
  color: #0097d7;
  border-color: rgba(0, 151, 215, 0.3);
}

/* Coluna de Assunto */
.subject-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subject-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ticket-id {
  font-size: 0.78rem;
  color: var(--text-light);
  font-weight: 600;
}

.subject-text {
  font-size: 0.96rem;
  font-weight: 600;
  color: var(--text-main);
}

.requester-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-light);
  flex-wrap: wrap;
}

.requester-name {
  font-weight: 500;
  color: var(--text-main);
}

.dot-separator {
  opacity: 0.4;
}

.env-tag {
  font-size: 0.74rem;
  background: var(--bg-card-subtle);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

/* Coluna de Data */
.date-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  color: var(--text-light);
}

.date-text {
  font-size: 0.8rem;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Corpo Expandido */
.ticket-expanded-body {
  padding: 24px;
  background: var(--bg-card-subtle);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeIn 0.2s ease-out;
}

/* Mensagem */
.msg-box {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 18px 20px;
}

.msg-box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.box-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.reply-email-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  background: #0097d7;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}

.reply-email-btn:hover {
  background: #0081b8;
}

.reply-email-btn svg {
  width: 14px;
  height: 14px;
}

.msg-content {
  color: var(--text-main);
  font-size: 0.94rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Grade de Gestão & Diagnóstico */
.ticket-management-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.admin-action-box,
.diagnostics-box {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 18px 20px;
}

.action-box-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.label-with-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.hint-text {
  font-size: 0.72rem;
  color: var(--text-light);
}

.status-buttons-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-choice-btn {
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-light);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.status-choice-btn:hover {
  border-color: #0097d7;
  color: var(--text-main);
}

.status-choice-btn.selected {
  background: #0097d7;
  color: #ffffff;
  border-color: #0097d7;
  font-weight: 600;
}

.admin-notes-textarea {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-main);
  font-size: 0.84rem;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.admin-notes-textarea:focus {
  border-color: #0097d7;
}

.notes-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.save-notes-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  background: #10b981;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.save-notes-btn:hover:not(:disabled) {
  background: #059669;
}

.save-notes-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-icon {
  width: 14px;
  height: 14px;
}

/* Diagnósticos */
.diag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.badge-tech {
  font-size: 0.72rem;
  background: rgba(0, 151, 215, 0.12);
  color: #0097d7;
  padding: 3px 8px;
  border-radius: 4px;
}

.diag-details-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.78rem;
}

.diag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-light);
  gap: 12px;
}

.diag-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.diag-key {
  color: var(--text-light);
}

.diag-val {
  color: var(--text-main);
  font-weight: 600;
  text-align: right;
}

.ellipsis-id {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Estados de feedback */
.loading-state,
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-light);
}

.loading-icon {
  width: 32px;
  height: 32px;
  margin-bottom: 12px;
  color: #0097d7;
}

.empty-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--bg-card-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.inbox-svg {
  width: 26px;
  height: 26px;
}

.empty-state h4 {
  font-size: 1.15rem;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 0.88rem;
  margin: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .kpis-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ticket-management-grid {
    grid-template-columns: 1fr;
  }
  .ticket-header-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .date-col {
    justify-content: space-between;
  }
}
</style>
