<template>
  <div class="admin-wrapper" :class="{ dark: isDark }">
    <LoginView
      v-if="!isLoggedIn"
      @login-success="handleLoginSuccess"
    />

    <template v-else>
      <AdminSidebar
        :current-tab="currentTab"
        :error-count="effectiveErrorCount"
        :open-tickets-count="openTicketsCount"
        :notifications-count="notificationsCount"
        :is-mobile-open="isMobileMenuOpen"
        @select-tab="setTab"
        @close-mobile="isMobileMenuOpen = false"
      />

      <div class="admin-content-area">
        <AdminTopbar
          :is-online="isOnline"
          :loading="loading"
          :is-dark="isDark"
          :user-email="currentUser?.email"
          :user-name="currentUser?.name"
          @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen"
          @refresh="handleRefresh"
          @toggle-theme="toggleTheme"
          @logout="handleLogout"
          @open-profile="isProfileModalOpen = true"
        />

        <main class="admin-main-viewport">
          <div v-if="currentTab === 'overview'" class="overview-layout">
            <HeroAnalyticsCard
              :total-songs="metrics.totalSongsPlayed"
              :total-slides="metrics.totalSlidesProjected"
              :total-devices="metrics.totalInstallations"
              :weekly-data="metrics.weeklyBreakdown"
              :selected-period="selectedPeriod"
              @select-period="setPeriod"
            />

            <div class="widgets-three-grid">
              <PlatformDistributionCard
                :total="metrics.totalInstallations"
                :data="metrics.platforms"
                :period="selectedPeriod"
              />
              <SystemHealthCard
                :error-count="effectiveErrorCount"
                :total-runs="metrics.totalEvents || metrics.totalSongsPlayed"
                :period="selectedPeriod"
              />
              <ModulesTrackerCard
                :modules="metrics.topModules"
                @view-all="setTab('devices')"
              />
            </div>
          </div>

          <div v-else-if="currentTab === 'songs'" class="tab-fade">
            <TopMusicTable
              :songs="metrics.topSongs"
              :engagement="metrics.musicEngagement"
            />
          </div>

          <div v-else-if="currentTab === 'devices'" class="tab-fade">
            <ModulesGrid
              :top-modules="metrics.topModules"
              :all-modules="metrics.allModules"
              :platforms="metrics.platforms"
            />
          </div>

          <div v-else-if="currentTab === 'notifications'" class="tab-fade">
            <NotificationsView
              :refresh-trigger="globalRefreshCounter"
              @update-active-count="val => notificationsCount = val"
            />
          </div>

          <div v-else-if="currentTab === 'diagnostics'" class="tab-fade">
            <ErrorsViewer
              :errors="metrics.recentErrors"
              @update-unseen-count="val => unseenErrorsCount = val"
            />
          </div>

          <div v-else-if="currentTab === 'support'" class="tab-fade">
            <SupportTicketsView @update-open-count="val => openTicketsCount = val" />
          </div>
        </main>

        <footer class="admin-footer">
          <span>Louvor JA Flute Admin Portal</span>
          <span class="font-mono">Última atualização às {{ lastUpdated }}</span>
        </footer>
      </div>

      <UserProfileModal
        v-if="isProfileModalOpen"
        :user-profile="currentUser"
        @close="isProfileModalOpen = false"
        @profile-updated="handleProfileUpdated"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import LoginView from "./components/LoginView.vue";
import SupportTicketsView from "./components/SupportTicketsView.vue";
import NotificationsView from "./components/NotificationsView.vue";
import UserProfileModal from "./components/UserProfileModal.vue";
import AdminSidebar from "./components/AdminSidebar.vue";
import AdminTopbar from "./components/AdminTopbar.vue";
import HeroAnalyticsCard from "./components/HeroAnalyticsCard.vue";
import PlatformDistributionCard from "./components/PlatformDistributionCard.vue";
import SystemHealthCard from "./components/SystemHealthCard.vue";
import ModulesTrackerCard from "./components/ModulesTrackerCard.vue";
import TopMusicTable from "./components/TopMusicTable.vue";
import ModulesGrid from "./components/ModulesGrid.vue";
import ErrorsViewer from "./components/ErrorsViewer.vue";
import {
  getTelemetryData,
  getEmptyTelemetryData,
  TelemetrySummary,
  isAuthenticated,
  getCurrentUser,
  fetchUserProfile,
  UserProfile,
  signOut,
  getSupportTickets,
  getAppNotifications,
} from "./services/supabase";

const isLoggedIn = ref(isAuthenticated());
const currentUser = ref<UserProfile | null>(getCurrentUser());
const openTicketsCount = ref(0);
const notificationsCount = ref(0);
const unseenErrorsCount = ref<number | null>(null);
const globalRefreshCounter = ref(0);
const isProfileModalOpen = ref(false);
const isMobileMenuOpen = ref(false);

const effectiveErrorCount = computed(() => {
  if (unseenErrorsCount.value !== null) {
    return unseenErrorsCount.value;
  }
  const clearedAt = localStorage.getItem("lja_errors_cleared_at");
  if (!clearedAt) return metrics.value.totalErrors;

  const clearedDate = new Date(clearedAt);
  const pending = (metrics.value.recentErrors || []).filter(
    (e) => new Date(e.created_at) > clearedDate
  );
  return pending.length;
});

const currentTab = ref("overview");
const selectedPeriod = ref("7d");
const loading = ref(false);
const isOnline = ref(true);
const lastUpdated = ref(new Date().toLocaleTimeString("pt-BR"));

const metrics = ref<TelemetrySummary>(getEmptyTelemetryData());

function setTab(tab: string) {
  currentTab.value = tab;
  isMobileMenuOpen.value = false;
}

function setPeriod(period: string) {
  selectedPeriod.value = period;
  loadData(period as "7d" | "30d" | "all");
}

async function loadData(period?: "7d" | "30d" | "all") {
  loading.value = true;
  try {
    const p = (period || selectedPeriod.value) as "7d" | "30d" | "all";
    const data = await getTelemetryData(p);
    metrics.value = data;
    isOnline.value = true;
    lastUpdated.value = new Date().toLocaleTimeString("pt-BR");
  } catch (e) {
    console.error("Falha ao carregar telemetria:", e);
    isOnline.value = false;
  } finally {
    loading.value = false;
  }
}

async function loadOpenTickets() {
  try {
    const tickets = await getSupportTickets();
    openTicketsCount.value = tickets.filter((t) => t.status === "open").length;
  } catch (err) {
    console.warn("Falha ao atualizar contagem de tickets:", err);
  }
}

async function loadActiveNotifications() {
  try {
    const list = await getAppNotifications();
    notificationsCount.value = list.filter((n) => n.is_active).length;
  } catch (err) {
    console.warn("Falha ao carregar contagem de notificações:", err);
  }
}

function handleRefresh() {
  globalRefreshCounter.value++;
  loadData(selectedPeriod.value as "7d" | "30d" | "all");
  loadOpenTickets();
  loadActiveNotifications();
}

function handleLoginSuccess() {
  isLoggedIn.value = true;
  currentUser.value = getCurrentUser();
  loadData(selectedPeriod.value as "7d" | "30d" | "all");
  loadOpenTickets();
  loadActiveNotifications();
  syncUserProfile();
}

function handleLogout() {
  signOut();
  isLoggedIn.value = false;
  currentUser.value = null;
}

function handleProfileUpdated(updatedUser: UserProfile) {
  currentUser.value = updatedUser;
}

async function syncUserProfile() {
  try {
    const profile = await fetchUserProfile();
    if (profile) {
      currentUser.value = profile;
    }
  } catch (err) {
    console.warn("Falha ao sincronizar perfil:", err);
  }
}

const isDark = ref(localStorage.getItem("lja_theme") === "dark");

function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
    localStorage.setItem("lja_theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
    localStorage.setItem("lja_theme", "light");
  }
}

function toggleTheme() {
  isDark.value = !isDark.value;
  applyTheme();
}

onMounted(() => {
  applyTheme();
  if (isLoggedIn.value) {
    loadData(selectedPeriod.value as "7d" | "30d" | "all");
    loadOpenTickets();
    loadActiveNotifications();
    syncUserProfile();
  }
});
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-app);
}

.admin-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 28px 32px;
  min-width: 0;
  max-width: 100%;
}

.admin-main-viewport {
  flex: 1;
}

/* Layout Limpo e Amplo */
.overview-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 3 Widgets Lado a Lado */
.widgets-three-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.tab-fade {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.admin-footer {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.76rem;
  color: var(--text-light);
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 1280px) {
  .overview-layout {
    grid-template-columns: 1fr;
  }
  .widgets-three-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}

@media (max-width: 980px) {
  .admin-wrapper {
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }

  .admin-content-area {
    padding: 16px 14px 28px;
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .widgets-three-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .overview-layout {
    gap: 16px;
  }

  .admin-footer {
    margin-top: 24px;
    padding-top: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .admin-content-area {
    padding: 12px 10px 24px;
  }
}
</style>
