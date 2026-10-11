<template>
  <header class="admin-header glass-panel">
    <div class="header-left">
      <div class="logo-box">
        <svg viewBox="0 0 24 24" class="logo-icon" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="6" cy="18" r="3" fill="currentColor"/>
          <circle cx="18" cy="16" r="3" fill="currentColor"/>
        </svg>
      </div>
      <div>
        <div class="title-row">
          <h1 class="header-title">Louvor JA</h1>
          <span class="badge-tag">FLUTE</span>
          <span class="status-indicator" :class="{ 'connected': isOnline }">
            <span class="pulse-dot"></span>
            {{ isOnline ? 'Supabase Conectado' : 'Offline' }}
          </span>
        </div>
        <p class="header-subtitle">Painel de Telemetria, Retenção & Monitoramento de Falhas</p>
      </div>
    </div>

    <div class="header-actions">
      <div class="mode-toggle" @click="$emit('toggle-demo')">
        <span class="mode-label">Fonte:</span>
        <button class="mode-btn" :class="{ active: isDemo }">
          {{ isDemo ? 'Modo Amostra' : 'Nuvem Direta' }}
        </button>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="$emit('refresh')">
        <svg
          class="refresh-icon"
          :class="{ spinning: loading }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 4v6h-6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1 20v-6h6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Atualizar
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
  isOnline: boolean;
  isDemo: boolean;
}>();

defineEmits<{
  (e: "refresh"): void;
  (e: "toggle-demo"): void;
}>();
</script>

<style scoped>
.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(58, 130, 247, 0.15));
  border: 1px solid rgba(0, 210, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-cyan);
}

.logo-icon {
  width: 26px;
  height: 26px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.badge-tag {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent-cyan);
  background: rgba(0, 210, 255, 0.12);
  border: 1px solid rgba(0, 210, 255, 0.3);
  padding: 2px 7px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.04);
  padding: 3px 9px;
  border-radius: 99px;
  border: 1px solid var(--border-subtle);
}

.status-indicator.connected {
  color: var(--accent-green);
  border-color: rgba(46, 204, 113, 0.25);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--accent-green);
  box-shadow: 0 0 8px var(--accent-green);
}

.header-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 4px 6px 4px 12px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-toggle:hover {
  background: rgba(255, 255, 255, 0.07);
}

.mode-label {
  font-size: 0.78rem;
  color: var(--text-dim);
  font-family: var(--font-mono);
}

.mode-btn {
  background: #1c223d;
  color: var(--text-main);
  border: 1px solid var(--border-active);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: rgba(0, 210, 255, 0.15);
  color: var(--accent-cyan);
  border-color: rgba(0, 210, 255, 0.4);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #2b6cb0, #1e4e8c);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(43, 108, 176, 0.3);
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #3182ce, #2b6cb0);
  transform: translateY(-1px);
}

.refresh-icon {
  width: 16px;
  height: 16px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
