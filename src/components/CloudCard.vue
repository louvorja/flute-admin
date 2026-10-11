<template>
  <div class="card-box cloud-card-wrap">
    <div class="card-header">
      <div>
        <h4 class="card-title">Louvor JA Cloud</h4>
        <span class="card-sub">Supabase Flute • Produção</span>
      </div>
      <button class="add-card-btn" @click="$emit('open-settings')">
        Configurações
      </button>
    </div>

    <!-- Cartão Visual Estilizado (Inspirado no cartão Visa da imagem) -->
    <div class="card-slider">
      <div class="smart-card">
        <div class="card-top-row">
          <div class="card-chip">
            <svg viewBox="0 0 24 24" class="chip-svg" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" fill="#e2b93b"/>
              <path d="M2 9h20M2 15h20M9 4v16M15 4v16" stroke="#997b1a" stroke-width="1.2"/>
            </svg>
          </div>
          <span class="card-network">FLUTE DB</span>
        </div>

        <div class="card-number font-mono">
          •••• •••• •••• 5271
        </div>

        <div class="card-bottom-row">
          <div class="card-holder-info">
            <span class="holder-name">LOUVOR JA DESKTOP</span>
            <span class="holder-sub">TELEMETRY INGEST ACTIVE</span>
          </div>
          <div class="card-status font-mono">
            <span class="live-dot"></span>
            <span>RLS ON</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ações Rápidas (como Top up, Send, Request, History, More na imagem) -->
    <div class="quick-actions-row">
      <button class="quick-action-btn" title="Atualizar dados agora" @click="$emit('refresh')">
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6m-9-3a9 9 0 0 0-4.64 4.36L1 14"/>
            <path d="M1 20v-6h6m9 3a9 9 0 0 0 4.64-4.36L23 10"/>
          </svg>
        </div>
        <span class="action-label">Sincronizar</span>
      </button>

      <button class="quick-action-btn" title="Alternar modo demonstração" @click="$emit('toggle-demo')">
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <span class="action-label">{{ isDemo ? 'Amostra' : 'Ao Vivo' }}</span>
      </button>

      <button class="quick-action-btn" title="Ir para falhas e diagnósticos" @click="$emit('open-diagnostics')">
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <span class="action-label">Diagnóstico</span>
      </button>

      <button class="quick-action-btn" title="Ver configurações de banco" @click="$emit('open-settings')">
        <div class="action-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <span class="action-label">Banco</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOnline: boolean;
  isDemo: boolean;
}>();

defineEmits<{
  (e: "refresh"): void;
  (e: "toggle-demo"): void;
  (e: "open-diagnostics"): void;
  (e: "open-settings"): void;
}>();
</script>

<style scoped>
.cloud-card-wrap {
  padding: 20px;
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

.add-card-btn {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-light);
  padding: 3px 9px;
  border-radius: var(--radius-xs);
  transition: opacity 0.16s ease;
}

.add-card-btn:hover {
  opacity: 0.85;
}

/* Cartão Visual */
.card-slider {
  margin-bottom: 20px;
}

.smart-card {
  background: linear-gradient(135deg, #094067 0%, #0097d7 55%, #3da9fc 100%);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(0, 151, 215, 0.3);
  position: relative;
  overflow: hidden;
}

.smart-card::after {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 65%);
  border-radius: 50%;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.card-chip {
  width: 30px;
  height: 22px;
}

.chip-svg {
  width: 100%;
  height: 100%;
}

.card-network {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.9);
}

.card-number {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-bottom: 18px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.card-bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-holder-info {
  display: flex;
  flex-direction: column;
}

.holder-name {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.holder-sub {
  font-size: 0.58rem;
  color: rgba(255, 255, 255, 0.75);
}

.card-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  background: rgba(0, 0, 0, 0.25);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
}

/* Quick Actions */
.quick-actions-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  transition: transform 0.16s ease;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
}

.action-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.16s ease;
}

.quick-action-btn:hover .action-icon-circle {
  background: var(--primary-light);
  color: var(--primary);
  border-color: rgba(0, 151, 215, 0.3);
}

.action-icon-circle svg {
  width: 17px;
  height: 17px;
}

.action-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
