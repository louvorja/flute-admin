<template>
  <div class="notifications-view-container">
    <!-- 1. Cabeçalho da Visão -->
    <div class="view-header-card card-box">
      <div class="header-text-group">
        <div class="title-with-badge">
          <h1 class="view-main-title">Central de Notificações para Usuários</h1>
          <span class="active-badge font-mono">
            {{ activeCount }} {{ activeCount === 1 ? 'ativa' : 'ativas' }}
          </span>
        </div>
        <p class="view-main-sub">
          Envie novidades, comunicados e alertas em tempo real para o ícone de notificações do programa Louvor JA em todas as congregações.
        </p>
      </div>

      <div class="header-action-group">
        <button
          type="button"
          class="btn-refresh"
          :disabled="loading"
          title="Recarregar notificações"
          @click="loadNotifications(true)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-svg" :class="{ spinning: loading }">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <button
          type="button"
          class="btn-primary-action"
          @click="openCreateModal"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-svg">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Nova Notificação</span>
        </button>
      </div>
    </div>

    <!-- 2. Cards de Métricas / KPIs de Notificações -->
    <div class="kpi-grid">
      <!-- Card 1: Total Criadas -->
      <div class="card-box kpi-card">
        <div class="kpi-head">
          <span class="kpi-label">Total Criadas</span>
          <span class="kpi-icon-wrap bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </span>
        </div>
        <span class="kpi-number font-mono">{{ notifications.length }}</span>
        <span class="kpi-foot">{{ activeCount }} ativas • {{ inactiveCount }} pausadas</span>
      </div>

      <!-- Card 2: Programas Instalados -->
      <div class="card-box kpi-card">
        <div class="kpi-head">
          <span class="kpi-label">Programas Instalados</span>
          <span class="kpi-icon-wrap bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </span>
        </div>
        <span class="kpi-number font-mono">{{ analytics.total_installations }}</span>
        <span class="kpi-foot">Base total de instalações</span>
      </div>

      <!-- Card 3: Alcance Geral (Visualizações) -->
      <div class="card-box kpi-card">
        <div class="kpi-head">
          <span class="kpi-label">Alcance Geral (Viram)</span>
          <span class="kpi-icon-wrap bg-cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </span>
        </div>
        <div class="kpi-number-row">
          <span class="kpi-number font-mono">{{ analytics.global_viewed_pct }}%</span>
          <span class="kpi-fraction font-mono">{{ analytics.global_viewed_count }}/{{ analytics.total_installations }}</span>
        </div>
        <span class="kpi-foot">Instalações viram as notificações</span>
      </div>

      <!-- Card 4: Engajamento Geral (Leituras) -->
      <div class="card-box kpi-card">
        <div class="kpi-head">
          <span class="kpi-label">Leituras (Leram)</span>
          <span class="kpi-icon-wrap bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <polyline points="9 9 12 12 16 8"/>
            </svg>
          </span>
        </div>
        <div class="kpi-number-row">
          <span class="kpi-number font-mono">{{ analytics.global_read_pct }}%</span>
          <span class="kpi-fraction font-mono">{{ analytics.global_read_count }}/{{ analytics.total_installations }}</span>
        </div>
        <span class="kpi-foot">Instalações abriram e leram</span>
      </div>
    </div>

    <!-- 3. Mensagem Toast de Feedback -->
    <div v-if="toastMessage" class="feedback-toast" :class="toastType">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-svg">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- 4. Filtros e Lista de Notificações -->
    <div class="card-box list-card">
      <div class="toolbar-row">
        <!-- Barra de Busca -->
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-svg">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filtrar por título ou conteúdo..."
            class="search-input"
          />
          <button v-if="searchQuery" type="button" class="clear-search-btn" @click="searchQuery = ''">✕</button>
        </div>

        <!-- Filtro de Status -->
        <div class="filter-pill-group">
          <button
            type="button"
            class="filter-pill"
            :class="{ active: statusFilter === 'all' }"
            @click="statusFilter = 'all'"
          >
            Todas
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ active: statusFilter === 'active' }"
            @click="statusFilter = 'active'"
          >
            Ativas ({{ activeCount }})
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ active: statusFilter === 'inactive' }"
            @click="statusFilter = 'inactive'"
          >
            Pausadas ({{ inactiveCount }})
          </button>
        </div>

        <!-- Filtro de Tipo -->
        <select v-model="typeFilter" class="type-select">
          <option value="all">Todos os Tipos</option>
          <option value="update">Atualização</option>
          <option value="feature">Novidade / Recurso</option>
          <option value="alert">Aviso Importante</option>
          <option value="info">Informativo</option>
        </select>
      </div>

      <!-- Estado de Carregamento -->
      <div v-if="loading && notifications.length === 0" class="state-container">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading-spinner spinning">
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
        <p>Carregando notificações registradas...</p>
      </div>

      <!-- Estado Vazio -->
      <div v-else-if="filteredNotifications.length === 0" class="state-container empty-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="bell-empty-svg">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <h4>Nenhuma notificação encontrada</h4>
        <p v-if="searchQuery || statusFilter !== 'all' || typeFilter !== 'all'">
          Tente ajustar os filtros ou os termos de pesquisa acima.
        </p>
        <p v-else>
          Clique em "Nova Notificação" para enviar o primeiro comunicado às congregações.
        </p>
      </div>

      <!-- Lista de Notificações -->
      <div v-else class="notifications-list">
        <div
          v-for="item in filteredNotifications"
          :key="item.id"
          class="notification-card"
          :class="{ 'card-inactive': !item.is_active }"
        >
          <div class="card-main-content">
            <!-- Cabeçalho do Card -->
            <div class="notif-header-row">
              <div class="type-and-title">
                <span class="type-badge" :class="`badge-type-${item.type}`">
                  <svg v-if="item.type === 'update'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="type-svg">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  <svg v-else-if="item.type === 'feature'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="type-svg">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <svg v-else-if="item.type === 'alert'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="type-svg">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="type-svg">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <span>{{ formatTypeName(item.type) }}</span>
                </span>

                <span v-if="item.priority === 'urgent'" class="priority-badge badge-urgent">
                  Urgente
                </span>
                <span v-else-if="item.priority === 'high'" class="priority-badge badge-high">
                  Alta Prioridade
                </span>

                <h3 class="notif-title">{{ item.title }}</h3>
              </div>

              <!-- Switch Toggle Ativo / Inativo -->
              <div class="toggle-status-wrap">
                <span class="status-text font-mono" :class="item.is_active ? 'text-active' : 'text-inactive'">
                  {{ item.is_active ? 'Publicada' : 'Pausada' }}
                </span>
                <button
                  type="button"
                  class="switch-btn"
                  :class="{ active: item.is_active }"
                  :title="item.is_active ? 'Pausar exibição aos usuários' : 'Ativar e exibir aos usuários'"
                  @click="handleToggleActive(item)"
                >
                  <span class="switch-handle"></span>
                </button>
              </div>
            </div>

            <!-- Corpo da Mensagem -->
            <div class="notif-body">
              <p class="notif-message-text">{{ item.message }}</p>

              <!-- Botão de Ação / Link Externo se configurado -->
              <div v-if="item.link_url" class="notif-action-link-wrap">
                <a
                  :href="item.link_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="action-link-btn"
                >
                  <span>{{ item.link_label || 'Acessar Link' }}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="link-ext-svg">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Painel de Alcance e Leitura Individual -->
            <div class="notif-metrics-panel">
              <div class="metric-block">
                <div class="metric-top">
                  <div class="metric-title-group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="metric-icon text-cyan">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span class="metric-name">Visualizações (Viram):</span>
                  </div>
                  <div class="metric-stat-group font-mono">
                    <span class="metric-count">{{ item.viewed_count || 0 }} de {{ analytics.total_installations }}</span>
                    <span class="metric-badge badge-cyan">{{ item.viewed_pct || 0 }}%</span>
                  </div>
                </div>
                <div class="metric-bar-bg">
                  <div class="metric-bar-fill fill-cyan" :style="{ width: `${item.viewed_pct || 0}%` }"></div>
                </div>
              </div>

              <div class="metric-block">
                <div class="metric-top">
                  <div class="metric-title-group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="metric-icon text-green">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      <polyline points="9 9 12 12 16 8"/>
                    </svg>
                    <span class="metric-name">Leituras (Leram):</span>
                  </div>
                  <div class="metric-stat-group font-mono">
                    <span class="metric-count">{{ item.read_count || 0 }} de {{ analytics.total_installations }}</span>
                    <span class="metric-badge badge-green">{{ item.read_pct || 0 }}%</span>
                  </div>
                </div>
                <div class="metric-bar-bg">
                  <div class="metric-bar-fill fill-green" :style="{ width: `${item.read_pct || 0}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Metadados de Rodapé -->
            <div class="notif-footer-row">
              <div class="notif-meta-tags font-mono">
                <span class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-svg">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{{ formatDate(item.created_at) }}</span>
                </span>

                <span v-if="item.target_audience && item.target_audience !== 'all'" class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-svg">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span>{{ formatAudience(item.target_audience) }}</span>
                </span>

                <span v-if="item.author_email" class="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{{ item.author_email }}</span>
                </span>
              </div>

              <!-- Ações do Card -->
              <div class="card-btn-actions">
                <button
                  type="button"
                  class="btn-icon-action btn-edit"
                  title="Editar Notificação"
                  @click="openEditModal(item)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  class="btn-icon-action btn-delete"
                  title="Excluir Notificação"
                  @click="confirmDelete(item)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Modal de Criação / Edição -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <div>
            <h2 class="modal-title">
              {{ editingItem ? 'Editar Notificação' : 'Criar Nova Notificação' }}
            </h2>
            <p class="modal-sub">
              Os dados enviados serão baixados instantaneamente pelo aplicativo desktop do Louvor JA.
            </p>
          </div>
          <button type="button" class="modal-close-btn" @click="closeModal">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSaveNotification">
          <div class="form-grid">
            <!-- Título -->
            <div class="form-group full-width">
              <label class="form-label" for="notif-title">
                Título da Notificação <span class="required">*</span>
              </label>
              <input
                id="notif-title"
                v-model="form.title"
                type="text"
                required
                placeholder="Ex: Atualização do Louvor JA 1.9.5 disponível!"
                class="form-input"
                maxlength="120"
              />
            </div>

            <!-- Tipo -->
            <div class="form-group">
              <label class="form-label" for="notif-type">Tipo de Comunicado</label>
              <select id="notif-type" v-model="form.type" class="form-select">
                <option value="update">Atualização do Aplicativo</option>
                <option value="feature">Novidade / Novo Recurso</option>
                <option value="alert">Aviso Importante</option>
                <option value="info">Informativo Geral</option>
              </select>
            </div>

            <!-- Prioridade -->
            <div class="form-group">
              <label class="form-label" for="notif-priority">Prioridade de Exibição</label>
              <select id="notif-priority" v-model="form.priority" class="form-select">
                <option value="normal">Normal</option>
                <option value="high">Alta Prioridade</option>
                <option value="urgent">Urgente (Destaque Máximo)</option>
              </select>
            </div>

            <!-- Mensagem -->
            <div class="form-group full-width">
              <label class="form-label" for="notif-message">
                Mensagem / Conteúdo <span class="required">*</span>
              </label>
              <textarea
                id="notif-message"
                v-model="form.message"
                required
                rows="4"
                placeholder="Descreva a mensagem que as congregações verão no painel de notificações..."
                class="form-textarea"
              ></textarea>
              <span class="form-hint font-mono">{{ form.message.length }} caracteres</span>
            </div>

            <!-- Link de Ação (URL) -->
            <div class="form-group">
              <label class="form-label" for="notif-link-url">Link de Ação (Opcional)</label>
              <input
                id="notif-link-url"
                v-model="form.link_url"
                type="url"
                placeholder="https://exemplo.com/download"
                class="form-input font-mono"
              />
            </div>

            <!-- Rótulo do Botão -->
            <div class="form-group">
              <label class="form-label" for="notif-link-label">Texto do Botão de Ação</label>
              <input
                id="notif-link-label"
                v-model="form.link_label"
                type="text"
                placeholder="Ex: Baixar Atualização / Saiba Mais"
                class="form-input"
              />
            </div>

            <!-- Público Alvo -->
            <div class="form-group">
              <label class="form-label" for="notif-target">Público-Alvo</label>
              <select id="notif-target" v-model="form.target_audience" class="form-select">
                <option value="all">Todas as Congregações (Geral)</option>
                <option value="windows">Apenas Windows</option>
                <option value="mac">Apenas macOS</option>
                <option value="linux">Apenas Linux</option>
              </select>
            </div>

            <!-- Checkbox Publicar Imediatamente -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span>Publicar imediatamente para os usuários</span>
              </label>
              <p class="checkbox-sub">
                Se desmarcado, a notificação ficará salva como rascunho pausado e poderá ser ativada mais tarde.
              </p>
            </div>
          </div>

          <!-- Preview da Notificação em Tempo Real -->
          <div class="preview-box">
            <span class="preview-label">PRÉVIA DA NOTIFICAÇÃO NO APP LOUVOR JA:</span>
            <div class="preview-card" :class="`preview-${form.type}`">
              <div class="preview-head">
                <span class="preview-type-badge font-mono">{{ formatTypeName(form.type) }}</span>
                <span class="preview-time font-mono">agora</span>
              </div>
              <h4 class="preview-title">{{ form.title || 'Título da Notificação' }}</h4>
              <p class="preview-body">{{ form.message || 'O texto da mensagem configurado aparecerá aqui para o operador do culto...' }}</p>
              <div v-if="form.link_url" class="preview-action">
                <button type="button" class="preview-btn">
                  {{ form.link_label || 'Acessar Link' }} →
                </button>
              </div>
            </div>
          </div>

          <!-- Ações do Modal -->
          <div class="modal-actions">
            <button
              type="button"
              class="btn-cancel"
              :disabled="saving"
              @click="closeModal"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn-save"
              :disabled="saving"
            >
              <svg v-if="saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning save-spinner">
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
              </svg>
              <span>{{ saving ? 'Salvando...' : (editingItem ? 'Salvar Alterações' : 'Disparar Notificação') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from "vue";
import {
  getAppNotifications,
  getNotificationAnalytics,
  createAppNotification,
  updateAppNotification,
  toggleNotificationActive,
  deleteAppNotification,
  type AppNotification,
  type NotificationAnalytics,
  type CreateNotificationInput,
} from "../services/supabase";

const props = defineProps<{
  refreshTrigger?: number;
}>();

const emit = defineEmits<{
  (e: "update-active-count", count: number): void;
}>();

const notifications = ref<AppNotification[]>([]);
const analytics = ref<NotificationAnalytics>({
  total_installations: 1,
  global_viewed_count: 0,
  global_read_count: 0,
  global_viewed_pct: 0,
  global_read_pct: 0,
  by_notification: {},
});
const loading = ref(false);
const saving = ref(false);

const searchQuery = ref("");
const statusFilter = ref<"all" | "active" | "inactive">("all");
const typeFilter = ref<string>("all");

const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");

const isModalOpen = ref(false);
const editingItem = ref<AppNotification | null>(null);

const form = reactive<CreateNotificationInput>({
  title: "",
  message: "",
  type: "update",
  priority: "normal",
  target_audience: "all",
  link_url: "",
  link_label: "",
  is_active: true,
  expires_at: null,
});

const activeCount = computed(() => {
  return notifications.value.filter((n) => n.is_active).length;
});

const inactiveCount = computed(() => {
  return notifications.value.filter((n) => !n.is_active).length;
});

const filteredNotifications = computed(() => {
  let list = [...notifications.value];

  // Filtro de status
  if (statusFilter.value === "active") {
    list = list.filter((n) => n.is_active);
  } else if (statusFilter.value === "inactive") {
    list = list.filter((n) => !n.is_active);
  }

  // Filtro de tipo
  if (typeFilter.value !== "all") {
    list = list.filter((n) => n.type === typeFilter.value);
  }

  // Filtro de busca
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }

  return list;
});

async function loadNotifications(showFeedback = false) {
  loading.value = true;
  try {
    const [data, an] = await Promise.all([
      getAppNotifications(),
      getNotificationAnalytics(),
    ]);
    notifications.value = data;
    if (an) {
      analytics.value = an;
    }
    emit("update-active-count", activeCount.value);
    if (showFeedback) {
      showToast("Notificações sincronizadas com sucesso!");
    }
  } catch (err) {
    console.error("Erro ao carregar notificações:", err);
    showToast("Falha ao sincronizar notificações.", "error");
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.refreshTrigger,
  () => {
    loadNotifications(true);
  }
);

defineExpose({
  loadNotifications,
});

function showToast(msg: string, type: "success" | "error" = "success") {
  toastMessage.value = msg;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = "";
  }, 4000);
}

function openCreateModal() {
  editingItem.value = null;
  form.title = "";
  form.message = "";
  form.type = "update";
  form.priority = "normal";
  form.target_audience = "all";
  form.link_url = "";
  form.link_label = "";
  form.is_active = true;
  form.expires_at = null;
  isModalOpen.value = true;
}

function openEditModal(item: AppNotification) {
  editingItem.value = item;
  form.title = item.title;
  form.message = item.message;
  form.type = item.type;
  form.priority = item.priority;
  form.target_audience = item.target_audience;
  form.link_url = item.link_url || "";
  form.link_label = item.link_label || "";
  form.is_active = item.is_active;
  form.expires_at = item.expires_at || null;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingItem.value = null;
}

async function handleSaveNotification() {
  if (!form.title.trim() || !form.message.trim()) {
    showToast("Preencha o título e a mensagem da notificação.", "error");
    return;
  }

  saving.value = true;
  try {
    if (editingItem.value) {
      await updateAppNotification(editingItem.value.id, form);
      showToast("Notificação atualizada com sucesso!");
    } else {
      await createAppNotification(form);
      showToast("Notificação disparada e publicada!");
    }
    closeModal();
    await loadNotifications();
  } catch (err) {
    console.error("Erro ao salvar notificação:", err);
    showToast("Não foi possível salvar a notificação.", "error");
  } finally {
    saving.value = false;
  }
}

async function handleToggleActive(item: AppNotification) {
  const newStatus = !item.is_active;
  item.is_active = newStatus; // update otimista
  try {
    const ok = await toggleNotificationActive(item.id, newStatus);
    if (ok) {
      showToast(newStatus ? "Notificação ativada no app!" : "Notificação pausada no app.");
      emit("update-active-count", activeCount.value);
    } else {
      item.is_active = !newStatus; // rollback
      showToast("Erro ao alterar status da notificação.", "error");
    }
  } catch {
    item.is_active = !newStatus;
    showToast("Erro ao alterar status da notificação.", "error");
  }
}

async function confirmDelete(item: AppNotification) {
  if (!window.confirm(`Deseja realmente excluir a notificação "${item.title}"?`)) {
    return;
  }

  try {
    const ok = await deleteAppNotification(item.id);
    if (ok) {
      notifications.value = notifications.value.filter((n) => n.id !== item.id);
      emit("update-active-count", activeCount.value);
      showToast("Notificação e histórico de visualizações removidos.");
      await loadNotifications();
    } else {
      showToast("Erro ao excluir notificação.", "error");
    }
  } catch {
    showToast("Erro ao excluir notificação.", "error");
  }
}

function formatTypeName(type: string): string {
  switch (type) {
    case "update": return "Atualização";
    case "feature": return "Novidade";
    case "alert": return "Aviso Importante";
    case "info": return "Informativo";
    default: return "Comunicado";
  }
}

function formatAudience(audience: string): string {
  switch (audience) {
    case "windows": return "Apenas Windows";
    case "mac": return "Apenas macOS";
    case "linux": return "Apenas Linux";
    default: return "Todas as congregações";
  }
}

function formatDate(isoStr: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoStr;
  }
}

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notifications-view-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 1. View Header Card */
.view-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 26px;
  gap: 20px;
  flex-wrap: wrap;
}

.header-text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.view-main-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.active-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  background: var(--success-light);
  color: var(--success);
}

.view-main-sub {
  font-size: 0.82rem;
  color: var(--text-muted);
  max-width: 680px;
  line-height: 1.4;
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-refresh {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-refresh:hover:not(:disabled) {
  color: var(--text-main);
  border-color: var(--border-color);
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: #fff;
  border: none;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.16s ease;
  box-shadow: 0 2px 8px rgba(0, 151, 215, 0.25);
}

.btn-primary-action:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.action-svg {
  width: 16px;
  height: 16px;
}

/* 2. KPIs Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.kpi-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-wrap svg {
  width: 17px;
  height: 17px;
}

.bg-blue { background: var(--primary-light); color: var(--primary); }
.bg-green { background: var(--success-light); color: var(--success); }
.bg-gray { background: var(--bg-card-subtle); color: var(--text-muted); }
.bg-purple { background: var(--purple-light); color: var(--purple); }
.bg-cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }

.kpi-number-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpi-fraction {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.kpi-number {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
}

.kpi-foot {
  font-size: 0.72rem;
  color: var(--text-light);
}

/* 3. Feedback Toast */
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

/* 4. Lista Card & Toolbar */
.list-card {
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 240px;
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

.type-select {
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

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 20px;
  text-align: center;
  color: var(--text-muted);
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  color: var(--primary);
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
}

.bell-empty-svg {
  width: 26px;
  height: 26px;
}

.empty-state h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.empty-state p {
  font-size: 0.82rem;
  max-width: 440px;
  margin: 0;
}

/* Notifications List Cards */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notification-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-card-subtle);
  padding: 18px 20px;
  transition: all 0.2s ease;
}

.notification-card:hover {
  border-color: var(--border-color);
  background: var(--bg-card);
}

.card-inactive {
  opacity: 0.65;
  border-style: dashed;
}

.card-main-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notif-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.type-and-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-full);
}

.type-svg {
  width: 12px;
  height: 12px;
}

.badge-type-update {
  background: rgba(0, 151, 215, 0.14);
  color: #0097d7;
}

.badge-type-feature {
  background: rgba(139, 92, 246, 0.14);
  color: #8b5cf6;
}

.badge-type-alert {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.badge-type-info {
  background: rgba(16, 185, 129, 0.14);
  color: #10b981;
}

.priority-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
}

.badge-urgent {
  background: var(--danger-light);
  color: var(--danger);
}

.badge-high {
  background: var(--warning-light);
  color: var(--warning);
}

.notif-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

/* Switch */
.toggle-status-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-text {
  font-size: 0.72rem;
  font-weight: 600;
}

.text-active { color: var(--success); }
.text-inactive { color: var(--text-light); }

.switch-btn {
  width: 36px;
  height: 20px;
  border-radius: 99px;
  background: var(--border-light);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.2s ease;
  padding: 2px;
}

.switch-btn.active {
  background: var(--success);
}

.switch-handle {
  display: block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.switch-btn.active .switch-handle {
  transform: translateX(16px);
}

/* Mensagem */
.notif-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-message-text {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}

.notif-action-link-wrap {
  display: flex;
}

.action-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  text-decoration: none;
  transition: background 0.16s ease;
}

.action-link-btn:hover {
  filter: brightness(1.1);
}

.link-ext-svg {
  width: 12px;
  height: 12px;
}

/* Painel de Métricas de Visualização e Leitura */
.notif-metrics-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .notif-metrics-panel {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.metric-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.76rem;
}

.metric-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-secondary);
}

.metric-icon {
  width: 15px;
  height: 15px;
}

.text-cyan { color: #06b6d4; }
.text-green { color: var(--success); }

.metric-stat-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-count {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-muted);
}

.metric-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: var(--radius-full);
}

.badge-cyan {
  background: rgba(6, 182, 212, 0.16);
  color: #06b6d4;
}

.badge-green {
  background: var(--success-light);
  color: var(--success);
}

.metric-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.fill-cyan {
  background: linear-gradient(90deg, #06b6d4, #0ea5e9);
}

.fill-green {
  background: linear-gradient(90deg, #10b981, #059669);
}

/* Rodapé do Card */
.notif-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  gap: 14px;
  flex-wrap: wrap;
}

.notif-meta-tags {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.meta-svg {
  width: 12px;
  height: 12px;
}

.card-btn-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-icon-action svg {
  width: 12px;
  height: 12px;
}

.btn-edit {
  color: var(--text-main);
}

.btn-edit:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-delete {
  color: var(--danger);
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-delete:hover {
  background: var(--danger-light);
}

/* 5. Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 26px;
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.modal-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 3px;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;
}

.modal-form {
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-main);
}

.required {
  color: var(--danger);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 9px 12px;
  font-size: 0.82rem;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  outline: none;
  transition: border-color 0.16s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: var(--primary);
}

.form-textarea {
  resize: vertical;
}

.form-hint {
  font-size: 0.7rem;
  color: var(--text-light);
  text-align: right;
}

.checkbox-group {
  grid-column: 1 / -1;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

.checkbox-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 4px 0 0 24px;
}

/* Preview Box */
.preview-box {
  background: var(--bg-card-subtle);
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.05em;
}

.preview-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-left: 3px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-update { border-left-color: #0097d7; }
.preview-feature { border-left-color: #8b5cf6; }
.preview-alert { border-left-color: #f59e0b; }
.preview-info { border-left-color: #10b981; }

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-type-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.preview-time {
  font-size: 0.65rem;
  color: var(--text-light);
}

.preview-title {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.preview-body {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.preview-action {
  margin-top: 4px;
}

.preview-btn {
  background: var(--primary-light);
  color: var(--primary);
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: default;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
}

.btn-cancel {
  padding: 8px 18px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-cancel:hover {
  color: var(--text-main);
  border-color: var(--border-color);
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  font-size: 0.82rem;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.16s ease;
}

.btn-save:hover:not(:disabled) {
  filter: brightness(1.1);
}

.save-spinner {
  width: 14px;
  height: 14px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsividade */
@media (max-width: 992px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
