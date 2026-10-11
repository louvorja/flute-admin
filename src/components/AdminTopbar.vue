<template>
  <header class="topbar-container">
    <!-- Left: Hamburger button & mobile logo (<980px) -->
    <div class="topbar-left">
      <button
        type="button"
        class="mobile-menu-toggle-btn"
        title="Abrir menu de navegação"
        @click="$emit('toggle-mobile-menu')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="hamburger-svg">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div class="mobile-brand-title">
        <img src="/logo.svg" alt="Louvor JA" class="mobile-logo-img" width="28" height="28" />
        <span class="mobile-brand-name">LOUVOR JA</span>
      </div>
    </div>

    <!-- Right: Actions & Profile -->
    <div class="topbar-actions">
      <!-- Status Pill -->
      <div class="status-pill" :class="{ online: isOnline }" :title="isOnline ? 'Servidor Conectado' : 'Desconectado'">
        <span class="status-dot"></span>
        <span class="status-text">{{ isOnline ? 'Conectado' : 'Desconectado' }}</span>
      </div>

      <!-- Theme Toggle Button (Sol / Lua) -->
      <button
        class="icon-circle-btn theme-toggle-btn"
        :title="isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'"
        @click="$emit('toggle-theme')"
      >
        <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="12" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- Sync / Refresh Button -->
      <button class="icon-circle-btn" :title="'Atualizar dados'" :disabled="loading" @click="$emit('refresh')">
        <svg
          viewBox="0 0 24 24"
          :class="{ spinning: loading }"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      </button>

      <!-- Admin Profile Pill & Logout -->
      <div class="profile-group">
        <button
          type="button"
          class="profile-pill-btn"
          title="Meu Perfil • Clique para alterar nome, e-mail e senha"
          @click="$emit('open-profile')"
        >
          <div class="avatar-circle">
            <span>{{ avatarInitials }}</span>
          </div>
          <div class="profile-info">
            <span class="profile-name">{{ userName || 'Administrador' }}</span>
            <span class="profile-role font-mono" :title="userEmail">{{ userEmail || 'admin@louvorja.org' }}</span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-gear-icon">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button class="logout-btn icon-circle-btn" title="Encerrar sessão" @click="$emit('logout')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  isOnline: boolean;
  loading: boolean;
  isDark?: boolean;
  userEmail?: string;
  userName?: string;
}>();

defineEmits<{
  (e: "toggle-mobile-menu"): void;
  (e: "refresh"): void;
  (e: "toggle-theme"): void;
  (e: "logout"): void;
  (e: "open-profile"): void;
}>();

const avatarInitials = computed(() => {
  if (props.userName) {
    const parts = props.userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return props.userName.slice(0, 2).toUpperCase();
  }
  if (props.userEmail) {
    const namePart = props.userEmail.split("@")[0];
    return namePart.slice(0, 2).toUpperCase();
  }
  return "LJ";
});
</script>

<style scoped>
.topbar-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

/* Actions Right */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.status-pill.online {
  color: var(--success);
  border-color: rgba(16, 185, 129, 0.2);
  background: var(--success-light);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.icon-circle-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  box-shadow: var(--shadow-xs);
  position: relative;
  transition: all 0.18s ease;
}

.icon-circle-btn:hover {
  color: var(--text-main);
  background: var(--bg-card-subtle);
  border-color: rgba(0, 0, 0, 0.1);
}

.icon-circle-btn svg {
  width: 18px;
  height: 18px;
}

.badge-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
  border: 1.5px solid var(--bg-card);
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Profile Pill Button */
.profile-pill-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 5px 12px 5px 6px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.profile-pill-btn:hover {
  border-color: #0097d7;
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}

.pill-gear-icon {
  width: 15px;
  height: 15px;
  color: var(--text-light);
  margin-left: 2px;
  transition: transform 0.3s ease, color 0.2s;
}

.profile-pill-btn:hover .pill-gear-icon {
  color: #0097d7;
  transform: rotate(45deg);
}

.avatar-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.1;
}

.profile-role {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.profile-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn:hover {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}

.topbar-left {
  display: none;
}

.mobile-menu-toggle-btn {
  display: none;
}

@media (max-width: 980px) {
  .topbar-container {
    justify-content: space-between;
    margin-bottom: 18px;
    gap: 10px;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mobile-menu-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    color: var(--text-main);
    cursor: pointer;
    box-shadow: var(--shadow-xs);
    transition: all 0.16s ease;
    flex-shrink: 0;
  }

  .mobile-menu-toggle-btn:hover {
    background: var(--bg-card-subtle);
    border-color: var(--primary);
  }

  .hamburger-svg {
    width: 20px;
    height: 20px;
  }

  .mobile-brand-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-logo-img {
    width: 26px;
    height: 26px;
  }

  .mobile-brand-name {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--text-main);
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .topbar-actions {
    gap: 8px;
    flex-wrap: nowrap;
  }

  .status-text {
    display: none;
  }

  .status-pill {
    padding: 6px 8px;
  }

  .profile-info {
    display: none;
  }

  .pill-gear-icon {
    display: none;
  }

  .profile-pill-btn {
    padding: 3px;
    border-radius: 50%;
  }

  .icon-circle-btn {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .mobile-brand-name {
    display: none;
  }
}
</style>
