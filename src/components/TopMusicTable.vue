<template>
  <div class="music-dashboard-container">
    <!-- 1. Linha Superior de Cards de Resumo (KPIs Musicais) -->
    <div class="music-kpi-grid">
      <!-- Card: Total de Execuções -->
      <div class="card-box kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Execuções Musicais</span>
          <span class="kpi-icon-wrap bg-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value font-mono">{{ totalPlays.toLocaleString('pt-BR') }}</span>
          <span class="kpi-badge font-mono badge-success">
            {{ completedPlays }} concluídas
          </span>
        </div>
        <span class="kpi-sub">Total de músicas projetadas nos cultos</span>
      </div>

      <!-- Card: Taxa Média de Retenção / Conclusão -->
      <div class="card-box kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Taxa Média de Conclusão</span>
          <span class="kpi-icon-wrap bg-green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value font-mono">{{ overallCompletionPct }}%</span>
          <div class="mini-progress-track">
            <div
              class="mini-progress-fill"
              :style="{ width: `${overallCompletionPct}%` }"
            ></div>
          </div>
        </div>
        <span class="kpi-sub">% médio de slides exibidos por hino</span>
      </div>

      <!-- Card: Duração Média por Hino -->
      <div class="card-box kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Tempo Médio em Culto</span>
          <span class="kpi-icon-wrap bg-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value font-mono">{{ formatDuration(avgDurationSeconds) }}</span>
          <span class="kpi-sub-badge font-mono">{{ totalSingingHours }}</span>
        </div>
        <span class="kpi-sub">Duração média de cada hino projetado</span>
      </div>

      <!-- Card: Modo de Áudio Predominante -->
      <div class="card-box kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Modo Preferido</span>
          <span class="kpi-icon-wrap bg-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </span>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-value">{{ primaryAudioLabel.label }}</span>
          <span class="kpi-badge font-mono badge-info">{{ primaryAudioLabel.pct }}%</span>
        </div>
        <span class="kpi-sub">{{ primaryAudioLabel.detail }}</span>
      </div>
    </div>

    <!-- 2. Linha com Métricas de Distribuição (Modos & Encerramento) -->
    <div class="distribution-row">
      <!-- Distribuição de Modos de Áudio -->
      <div class="card-box dist-card">
        <div class="dist-card-header">
          <div class="dist-title-group">
            <h3 class="dist-title">Distribuição por Modo de Áudio</h3>
            <span class="dist-sub">Preferência das congregações ao cantar</span>
          </div>
        </div>
        <div class="dist-bars-list">
          <div
            v-for="item in audioModesList"
            :key="item.mode"
            class="dist-bar-item"
          >
            <div class="dist-bar-meta">
              <span class="dist-bar-label">
                <span class="dist-bar-icon-svg">
                  <svg v-if="item.mode === 'cantado'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  <svg v-else-if="item.mode === 'playback'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-svg">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-svg">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                </span>
                {{ item.label }}
              </span>
              <span class="dist-bar-val font-mono">
                <strong>{{ item.count }}</strong> ({{ item.pct }}%)
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="`bar-${item.mode}`"
                :style="{ width: `${item.pct}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Motivos de Encerramento (Retenção) -->
      <div class="card-box dist-card">
        <div class="dist-card-header">
          <div class="dist-title-group">
            <h3 class="dist-title">Retenção & Término da Música</h3>
            <span class="dist-sub">Como os operadores encerram os hinos</span>
          </div>
        </div>
        <div class="dist-bars-list">
          <div
            v-for="item in stopReasonsList"
            :key="item.reason"
            class="dist-bar-item"
          >
            <div class="dist-bar-meta">
              <span class="dist-bar-label">{{ item.label }}</span>
              <span class="dist-bar-val font-mono">
                <strong>{{ item.count }}</strong> ({{ item.pct }}%)
              </span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="`bar-${item.reason}`"
                :style="{ width: `${item.pct}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Tabela Principal de Músicas Detalhadas -->
    <div class="card-box music-table-card">
      <div class="table-top-bar">
        <div>
          <h2 class="table-main-title">Repertório de Hinos & Músicas</h2>
          <p class="table-main-sub">
            Métricas detalhadas de execuções congregacionais, retenção de slides e modos de áudio
          </p>
        </div>

        <div class="table-controls">
          <!-- Filtro de Modo de Áudio (Apenas os 3 modos oficiais com ícones SVG) -->
          <div class="filter-pill-group">
            <button
              class="filter-pill-btn"
              :class="{ active: selectedMode === 'all' }"
              @click="selectedMode = 'all'"
            >
              Todos
            </button>
            <button
              class="filter-pill-btn"
              :class="{ active: selectedMode === 'cantado' }"
              @click="selectedMode = 'cantado'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-svg">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              <span>Cantado</span>
            </button>
            <button
              class="filter-pill-btn"
              :class="{ active: selectedMode === 'playback' }"
              @click="selectedMode = 'playback'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-svg">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span>Playback</span>
            </button>
            <button
              class="filter-pill-btn"
              :class="{ active: selectedMode === 'no_audio' }"
              @click="selectedMode = 'no_audio'"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-svg">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
              <span>Sem Áudio</span>
            </button>
          </div>

          <!-- Ordenação -->
          <select v-model="sortBy" class="sort-select">
            <option value="plays">Mais Tocadas</option>
            <option value="completion">Maior Conclusão (%)</option>
            <option value="duration">Maior Duração</option>
          </select>
        </div>
      </div>

      <!-- Estado Vazio -->
      <div v-if="filteredAndSortedSongs.length === 0" class="empty-state">
        <div class="empty-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <h4>Nenhuma música encontrada</h4>
        <p>Os registros congregacionais aparecerão assim que os hinos forem iniciados no Louvor JA.</p>
      </div>

      <!-- Lista Tabela -->
      <div v-else class="songs-table-wrap">
        <table class="songs-table">
          <thead>
            <tr>
              <th class="th-rank">#</th>
              <th class="th-song">Música & Hinário</th>
              <th class="th-mode">Modo de Áudio</th>
              <th class="th-plays">Execuções</th>
              <th class="th-completion">Conclusão</th>
              <th class="th-duration">Duração Média</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(song, idx) in filteredAndSortedSongs" :key="song.name">
              <!-- Rank -->
              <td class="td-rank">
                <span class="rank-badge font-mono" :class="getRankClass(idx)">
                  {{ idx + 1 }}
                </span>
              </td>

              <!-- Informações da Música -->
              <td class="td-song">
                <div class="song-title-wrap">
                  <span class="song-name-text">{{ cleanSongName(song.name) }}</span>
                  <div class="song-tags-row">
                    <!-- Subtítulo (ex: 585 - Hinário Adventista) -->
                    <span v-if="song.subtitle" class="song-sub-tag font-mono">
                      {{ song.subtitle }}
                    </span>

                    <!-- Álbum apenas se o subtítulo não já contiver o nome dele -->
                    <span
                      v-if="song.album && (!song.subtitle || !song.subtitle.toLowerCase().includes(song.album.toLowerCase()))"
                      class="song-album-tag"
                    >
                      {{ song.album }}
                    </span>

                    <!-- Badge para arquivos avulsos (.slja) -->
                    <span
                      v-if="song.is_external || (!song.subtitle && !song.album)"
                      class="song-external-tag font-mono"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tag-svg">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                        <polyline points="13 2 13 9 20 9"/>
                      </svg>
                      <span>Arquivo Avulso</span>
                    </span>
                  </div>
                </div>
              </td>

              <!-- Modo de Áudio com Ícones SVG -->
              <td class="td-mode">
                <span
                  class="audio-mode-badge"
                  :class="`mode-${song.primaryAudioMode || 'cantado'}`"
                >
                  <svg v-if="song.primaryAudioMode === 'playback'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="badge-mode-svg">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                  <svg v-else-if="song.primaryAudioMode === 'no_audio'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="badge-mode-svg">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="badge-mode-svg">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  <span>{{ formatAudioMode(song.primaryAudioMode) }}</span>
                </span>
              </td>

              <!-- Contagem de Execuções -->
              <td class="td-plays font-mono">
                <div class="plays-cell">
                  <strong>{{ song.count.toLocaleString('pt-BR') }}</strong>
                  <span v-if="song.completed" class="completed-hint">
                    {{ song.completed }} completas
                  </span>
                </div>
              </td>

              <!-- Taxa de Conclusão -->
              <td class="td-completion">
                <div class="completion-cell">
                  <div class="completion-info font-mono">
                    <span>{{ song.avgCompletionPct || 85 }}%</span>
                  </div>
                  <div class="table-bar-track">
                    <div
                      class="table-bar-fill"
                      :style="{ width: `${song.avgCompletionPct || 85}%` }"
                      :class="getCompletionColorClass(song.avgCompletionPct || 85)"
                    ></div>
                  </div>
                </div>
              </td>

              <!-- Duração Média -->
              <td class="td-duration font-mono">
                <div class="duration-cell">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clock-icon">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{{ formatDuration(song.avgDurationSeconds || 210) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { DetailedSong, MusicEngagementSummary } from "../services/supabase";

const props = defineProps<{
  songs?: DetailedSong[];
  engagement?: MusicEngagementSummary;
}>();

const selectedMode = ref("all");
const sortBy = ref("plays");

const songsList = computed(() => props.songs || []);

const totalPlays = computed(() => {
  if (props.engagement?.totalPlays) return props.engagement.totalPlays;
  return songsList.value.reduce((acc, s) => acc + (s.count || 0), 0);
});

const completedPlays = computed(() => {
  if (props.engagement?.completedPlays) return props.engagement.completedPlays;
  return songsList.value.reduce((acc, s) => acc + (s.completed || 0), 0);
});

const overallCompletionPct = computed(() => {
  if (props.engagement?.overallCompletionPct) return props.engagement.overallCompletionPct;
  if (songsList.value.length === 0) return 0;
  const total = songsList.value.reduce((acc, s) => acc + (s.avgCompletionPct || 85), 0);
  return Math.round(total / songsList.value.length);
});

const avgDurationSeconds = computed(() => {
  if (props.engagement?.avgDurationSeconds) return props.engagement.avgDurationSeconds;
  if (songsList.value.length === 0) return 0;
  const total = songsList.value.reduce((acc, s) => acc + (s.avgDurationSeconds || 210), 0);
  return Math.round(total / songsList.value.length);
});

const totalSingingHours = computed(() => {
  const totalSec = props.engagement?.totalDurationSeconds || songsList.value.reduce((acc, s) => acc + (s.totalDurationSeconds || 0), 0);
  if (totalSec < 60) return `${totalSec}s`;
  if (totalSec < 3600) return `${Math.round(totalSec / 60)} min`;
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.round((totalSec % 3600) / 60);
  return `${hours}h ${mins}m`;
});

const audioModesList = computed(() => {
  if (props.engagement?.audioModeDistribution && props.engagement.audioModeDistribution.some(m => m.count > 0)) {
    return props.engagement.audioModeDistribution.filter(m => m.mode !== "instrumental");
  }
  return [
    { mode: "cantado", label: "Cantado", icon: "cantado", count: totalPlays.value, pct: 100 },
    { mode: "playback", label: "Playback", icon: "playback", count: 0, pct: 0 },
    { mode: "no_audio", label: "Sem Áudio", icon: "no_audio", count: 0, pct: 0 },
  ];
});

const stopReasonsList = computed(() => {
  if (props.engagement?.stopReasonDistribution && props.engagement.stopReasonDistribution.some(r => r.count > 0)) {
    return props.engagement.stopReasonDistribution;
  }
  const completed = completedPlays.value;
  const closed = Math.max(0, totalPlays.value - completed);
  const total = Math.max(1, totalPlays.value);
  return [
    { reason: "completed", label: "Concluída até o fim", count: completed, pct: Math.round((completed / total) * 100) },
    { reason: "next_song", label: "Avançou para próxima", count: 0, pct: 0 },
    { reason: "closed", label: "Fechou o player", count: closed, pct: Math.round((closed / total) * 100) },
    { reason: "app_closed", label: "App encerrado", count: 0, pct: 0 },
  ];
});

const primaryAudioLabel = computed(() => {
  const modes = audioModesList.value;
  const sorted = [...modes].sort((a, b) => b.count - a.count);
  const leader = sorted[0] || { label: "Cantado", pct: 100 };
  return {
    label: leader.label,
    pct: leader.pct,
    detail: `${leader.count} de ${totalPlays.value} execuções`,
  };
});

const filteredAndSortedSongs = computed(() => {
  let list = [...songsList.value];

  // Filtro por modo
  if (selectedMode.value !== "all") {
    list = list.filter((s) => s.primaryAudioMode === selectedMode.value);
  }

  // Ordenação
  if (sortBy.value === "plays") {
    list.sort((a, b) => (b.count || 0) - (a.count || 0));
  } else if (sortBy.value === "completion") {
    list.sort((a, b) => (b.avgCompletionPct || 0) - (a.avgCompletionPct || 0));
  } else if (sortBy.value === "duration") {
    list.sort((a, b) => (b.avgDurationSeconds || 0) - (a.avgDurationSeconds || 0));
  }

  return list;
});

function cleanSongName(name: string): string {
  return (name || "").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function formatDuration(sec: number): string {
  if (!sec || sec <= 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatAudioMode(mode?: string): string {
  switch (mode) {
    case "playback": return "Playback";
    case "no_audio": return "Sem Áudio";
    default: return "Cantado";
  }
}

function getRankClass(idx: number): string {
  if (idx === 0) return "rank-first";
  if (idx === 1) return "rank-second";
  if (idx === 2) return "rank-third";
  return "";
}

function getCompletionColorClass(pct: number): string {
  if (pct >= 85) return "comp-high";
  if (pct >= 60) return "comp-med";
  return "comp-low";
}
</script>

<style scoped>
.music-dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 1. KPIs Musicais */
.music-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-title {
  font-size: 0.8rem;
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

.bg-blue {
  background: var(--primary-light);
  color: var(--primary);
}

.bg-green {
  background: var(--success-light);
  color: var(--success);
}

.bg-purple {
  background: var(--purple-light);
  color: var(--purple);
}

.bg-amber {
  background: var(--warning-light);
  color: var(--warning);
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
}

.kpi-value {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.kpi-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.kpi-sub-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.badge-success {
  background: var(--success-light);
  color: var(--success);
}

.badge-info {
  background: var(--info-light);
  color: var(--info);
}

.kpi-sub {
  font-size: 0.72rem;
  color: var(--text-light);
}

.mini-progress-track {
  width: 60px;
  height: 6px;
  background: var(--track-bg);
  border-radius: 99px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: var(--success);
  border-radius: 99px;
}

/* 2. Distribuição Row */
.distribution-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dist-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dist-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dist-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
}

.dist-sub {
  font-size: 0.73rem;
  color: var(--text-muted);
}

.dist-bars-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-bar-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.dist-bar-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
}

.dist-bar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-secondary);
}

.dist-bar-icon-svg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: var(--bg-card-subtle);
  color: var(--text-muted);
}

.meta-svg {
  width: 12px;
  height: 12px;
}

.dist-bar-val {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.dist-bar-val strong {
  color: var(--text-main);
}

.bar-track {
  width: 100%;
  height: 7px;
  background: var(--track-bg);
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.bar-cantado {
  background: linear-gradient(90deg, #0097d7, #38bdf8);
}

.bar-playback {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.bar-no_audio {
  background: #64748b;
}

.bar-completed {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.bar-next_song {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.bar-closed {
  background: linear-gradient(90deg, #0284c7, #38bdf8);
}

.bar-app_closed {
  background: #94a3b8;
}

/* 3. Tabela Principal */
.music-table-card {
  padding: 24px;
}

.table-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.table-main-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.table-main-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-pill-group {
  display: flex;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 3px;
  gap: 2px;
}

.filter-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-xs);
  transition: all 0.16s ease;
}

.pill-svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.filter-pill-btn:hover {
  color: var(--text-main);
}

.filter-pill-btn.active {
  background: var(--bg-card);
  color: var(--text-main);
  box-shadow: var(--shadow-xs);
}

.sort-select {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
}

.sort-select:focus {
  border-color: var(--primary);
}

.songs-table-wrap {
  overflow-x: auto;
}

.songs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.songs-table th {
  padding: 12px 14px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-light);
}

.songs-table td {
  padding: 14px 14px;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
}

.songs-table tbody tr:hover td {
  background-color: var(--bg-card-hover);
}

.th-rank { width: 50px; }
.th-plays { width: 140px; }
.th-mode { width: 150px; }
.th-completion { width: 160px; }
.th-duration { width: 130px; }

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
}

.rank-first {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}

.rank-second {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.rank-third {
  background: #ffedd5;
  color: #c2410c;
  border-color: #fed7aa;
}

.song-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.song-name-text {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.song-tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.song-sub-tag {
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-card-subtle);
  padding: 2px 6px;
  border-radius: 4px;
}

.song-album-tag {
  font-size: 0.68rem;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.song-external-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-card-subtle);
  border: 1px dashed var(--border-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.tag-svg {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

.audio-mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: var(--radius-full);
}

.badge-mode-svg {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.mode-cantado {
  background: var(--primary-light);
  color: var(--primary);
}

.mode-playback {
  background: var(--success-light);
  color: var(--success);
}

.mode-no_audio {
  background: var(--bg-card-subtle);
  color: var(--text-muted);
}

.plays-cell {
  display: flex;
  flex-direction: column;
}

.plays-cell strong {
  font-size: 0.92rem;
  color: var(--text-main);
}

.completed-hint {
  font-size: 0.68rem;
  color: var(--success);
}

.completion-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.completion-info {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.table-bar-track {
  width: 100%;
  height: 6px;
  background: var(--track-bg);
  border-radius: 99px;
  overflow: hidden;
}

.table-bar-fill {
  height: 100%;
  border-radius: 99px;
}

.comp-high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.comp-med {
  background: linear-gradient(90deg, #0284c7, #38bdf8);
}

.comp-low {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.duration-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.clock-icon {
  width: 14px;
  height: 14px;
  color: var(--text-light);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
}

.empty-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--bg-card-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--text-light);
}

.empty-icon-box svg {
  width: 24px;
  height: 24px;
}

.empty-state h4 {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 6px;
}

.empty-state p {
  font-size: 0.78rem;
  color: var(--text-muted);
  max-width: 440px;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 1024px) {
  .music-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .distribution-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .music-kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
