<template>
  <div class="card-box feed-card">
    <div class="card-header">
      <div>
        <h4 class="card-title">Eventos Recentes</h4>
        <span class="card-sub">Transmissões e execuções nas congregações</span>
      </div>
      <span class="feed-tag font-mono">Ao Vivo</span>
    </div>

    <!-- Lista de Eventos (Inspirado na lista de Transaction History da imagem) -->
    <div class="events-list">
      <div v-for="evt in events" :key="evt.id" class="event-item">
        <div class="event-icon-box" :style="{ background: evt.iconBg }">
          <span>{{ evt.emoji }}</span>
        </div>

        <div class="event-info">
          <span class="event-title">{{ evt.title }}</span>
          <span class="event-meta">{{ evt.church }} • {{ evt.time }}</span>
        </div>

        <div class="event-badge-col">
          <span class="event-pill" :class="evt.pillClass">
            {{ evt.tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const events = [
  {
    id: 1,
    title: "Porque Ele Vive",
    church: "IASD Central",
    time: "há 3 min",
    emoji: "🎵",
    iconBg: "#dcfce7",
    tag: "+1 Áudio",
    pillClass: "pill-success",
  },
  {
    id: 2,
    title: "18 Slides de Hino Projetados",
    church: "IASD Norte",
    time: "há 9 min",
    emoji: "📽️",
    iconBg: "#e0f2fe",
    tag: "Projeção",
    pillClass: "pill-info",
  },
  {
    id: 3,
    title: "Nova Máquina (macOS 15)",
    church: "IASD Jardim",
    time: "há 18 min",
    emoji: "💻",
    iconBg: "#f3e8ff",
    tag: "Ativa",
    pillClass: "pill-purple",
  },
  {
    id: 4,
    title: "Grandioso És Tu (Completo)",
    church: "IASD Jovem",
    time: "há 26 min",
    emoji: "🎵",
    iconBg: "#dcfce7",
    tag: "Completo",
    pillClass: "pill-success",
  },
  {
    id: 5,
    title: "Cronômetro de Sermão Iniciado",
    church: "IASD Sul",
    time: "há 34 min",
    emoji: "⏱️",
    iconBg: "#ffedd5",
    tag: "Culto",
    pillClass: "pill-orange",
  },
  {
    id: 6,
    title: "Bíblia: Salmos 23 Projetado",
    church: "IASD Betel",
    time: "há 42 min",
    emoji: "📖",
    iconBg: "#fef3c7",
    tag: "Leitura",
    pillClass: "pill-warning",
  },
];
</script>

<style scoped>
.feed-card {
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

.feed-tag {
  font-size: 0.7rem;
  background: var(--success-light);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  font-weight: 700;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.event-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.event-badge-col {
  flex-shrink: 0;
}

.event-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-full);
}

.pill-success {
  background: var(--success-light);
  color: var(--success);
}

.pill-info {
  background: var(--info-light);
  color: var(--info);
}

.pill-purple {
  background: var(--purple-light);
  color: var(--purple);
}

.pill-orange {
  background: #ffedd5;
  color: #ea580c;
}

.pill-warning {
  background: var(--warning-light);
  color: var(--warning);
}
</style>
