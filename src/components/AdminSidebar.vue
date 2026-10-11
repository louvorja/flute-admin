<template>
  <div class="sidebar-root-wrapper">
    <!-- Backdrop para Mobile (<980px) -->
    <div
      v-if="isMobileOpen"
      class="sidebar-mobile-backdrop"
      @click="$emit('close-mobile')"
    ></div>

    <aside
      class="sidebar-container"
      :class="{
        collapsed: isCollapsed,
        'mobile-open': isMobileOpen
      }"
    >
      <!-- Brand / Logo -->
      <div class="sidebar-header">
        <div class="brand-wrap">
          <div class="logo-box">
            <img src="/logo.svg" alt="Louvor JA" class="login-logo-img" width="40"/>
          </div>
          <div v-if="!isCollapsed" class="brand-info">
            <span class="brand-title">LOUVOR JA FLUTE</span>
            <span class="brand-sub">PAINEL ADMIN</span>
          </div>
        </div>

        <!-- Botão Fechar no Mobile (<980px) -->
        <button
          type="button"
          class="mobile-close-btn"
          title="Fechar menu"
          @click="$emit('close-mobile')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Navigation List -->
      <nav class="sidebar-nav">
        <div v-if="!isCollapsed" class="nav-section-label">MENU PRINCIPAL</div>

        <button
          v-for="item in menuItems"
          :key="item.id"
          class="nav-item-btn"
          :class="{ active: currentTab === item.id }"
          :title="item.label"
          @click="handleSelect(item.id)"
        >
          <span class="nav-active-bar" v-if="currentTab === item.id"></span>
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
          <span
            v-if="item.badge && !isCollapsed"
            class="nav-badge"
            :class="item.badgeType"
          >
            {{ item.badge }}
          </span>
        </button>
      </nav>

      <!-- Collapse Toggle Footer -->
      <div class="sidebar-footer">
        <button class="collapse-btn" @click="toggleCollapse">
          <svg viewBox="0 0 24 24" class="collapse-svg" :class="{ rotated: isCollapsed }" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="!isCollapsed" class="collapse-text">Recolher barra lateral</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  currentTab: string;
  errorCount?: number;
  openTicketsCount?: number;
  notificationsCount?: number;
  isMobileOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: "select-tab", tab: string): void;
  (e: "close-mobile"): void;
}>();

const isCollapsed = ref(false);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

function handleSelect(tab: string) {
  emit("select-tab", tab);
  emit("close-mobile");
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  badgeType?: string;
}

const menuItems = computed<MenuItem[]>(() => [
  {
    id: "overview",
    label: "Dashboard",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`,
  },
  {
    id: "songs",
    label: "Repertório & Músicas",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  },
  {
    id: "devices",
    label: "Igrejas & Dispositivos",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  },
  {
    id: "notifications",
    label: "Notificações",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    badge: props.notificationsCount && props.notificationsCount > 0 ? String(props.notificationsCount) : undefined,
    badgeType: "badge-primary",
  },
  {
    id: "diagnostics",
    label: "Falhas & Erros",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    badge: props.errorCount && props.errorCount > 0 ? String(props.errorCount) : undefined,
    badgeType: "badge-warn",
  },
  {
    id: "support",
    label: "Suporte & Chamados",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    badge: props.openTicketsCount && props.openTicketsCount > 0 ? String(props.openTicketsCount) : undefined,
    badgeType: "badge-accent",
  },
]);
</script>

<style scoped>
.sidebar-container {
  width: var(--sidebar-width);
  background: var(--bg-card);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  user-select: none;
  overflow-y: auto;
}

.sidebar-container.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  padding: 24px 20px 20px;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-box {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.logo-svg {
  width: 100%;
  height: 100%;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-main);
  line-height: 1.1;
}

.brand-sub {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.sidebar-nav {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.06em;
  padding: 8px 12px 6px;
}

.nav-item-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 500;
  position: relative;
  transition: all 0.18s ease;
  width: 100%;
  text-align: left;
}

.nav-item-btn:hover {
  background: var(--bg-card-subtle);
  color: var(--text-main);
}

.nav-item-btn.active {
  background: var(--bg-card-subtle);
  color: var(--text-main);
  font-weight: 600;
}

.nav-active-bar {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3.5px;
  background: var(--text-main);
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.nav-icon :deep(svg) {
  width: 19px;
  height: 19px;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.nav-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}

.badge-warn {
  background: var(--warning-light);
  color: var(--warning);
}

.badge-accent {
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

/* Bottom Promo Box (Estilo Acru/Modern SaaS) */
.sidebar-bottom-card {
  padding: 16px;
}

.promo-box {
  background: #0f172a;
  border-radius: var(--radius-md);
  padding: 16px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.promo-box::before {
  content: "";
  position: absolute;
  top: -20px;
  right: -20px;
  width: 70px;
  height: 70px;
  background: radial-gradient(circle, rgba(0, 151, 215, 0.4) 0%, transparent 70%);
  border-radius: 50%;
}

.promo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.promo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.promo-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.04em;
}

.promo-title {
  font-size: 0.88rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.promo-desc {
  font-size: 0.72rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-bottom: 12px;
}

.promo-btn {
  width: 100%;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-align: center;
  transition: opacity 0.18s ease;
}

.promo-btn:hover {
  opacity: 0.92;
}

/* Footer / Collapse Button */
.sidebar-footer {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--border-light);
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all 0.18s ease;
}

.collapse-btn:hover {
  color: var(--text-main);
  background: var(--bg-card-subtle);
}

.collapse-svg {
  width: 16px;
  height: 16px;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.collapse-svg.rotated {
  transform: rotate(180deg);
}

.collapse-text {
  white-space: nowrap;
}

/* Responsividade Mobile (<980px) */
.sidebar-mobile-backdrop {
  display: none;
}

.mobile-close-btn {
  display: none;
}

@media (max-width: 980px) {
  .sidebar-mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 998;
    animation: fadeIn 0.2s ease-out;
  }

  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px !important;
    max-width: 84vw;
    height: 100vh;
    height: 100dvh;
    z-index: 999;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.45);
    transform: translateX(-100%);
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sidebar-container.mobile-open {
    transform: translateX(0);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 18px 16px;
  }

  .mobile-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    background: var(--bg-card-subtle);
    border: 1px solid var(--border-light);
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.16s ease;
  }

  .mobile-close-btn:hover {
    color: var(--text-main);
    border-color: var(--border-color);
  }

  .mobile-close-btn svg {
    width: 18px;
    height: 18px;
  }

  .sidebar-footer {
    display: none;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
