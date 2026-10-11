<template>
  <div class="card-box active-churches-card">
    <div class="card-header">
      <div>
        <h4 class="card-title">Igrejas & Conexões Ativas</h4>
        <span class="card-sub">Dispositivos em transmissão</span>
      </div>
    </div>

    <!-- Linha de Avatares Circulares (Inspirado no Quick Payment da imagem) -->
    <div class="churches-row">
      <div v-for="church in churches" :key="church.name" class="church-avatar-item">
        <div class="avatar-bubble" :style="{ background: church.gradient }">
          <span>{{ church.initials }}</span>
          <span v-if="church.online" class="online-pulse"></span>
        </div>
        <span class="church-label">{{ church.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const churches = [
  { name: "Central", initials: "IC", gradient: "linear-gradient(135deg, #0284c7, #0369a1)", online: true },
  { name: "Jardim", initials: "JD", gradient: "linear-gradient(135deg, #059669, #047857)", online: true },
  { name: "Norte", initials: "IN", gradient: "linear-gradient(135deg, #d97706, #b45309)", online: true },
  { name: "JA Jovem", initials: "JJ", gradient: "linear-gradient(135deg, #7c3aed, #6d28d9)", online: true },
  { name: "Leste", initials: "IL", gradient: "linear-gradient(135deg, #e11d48, #be123c)", online: false },
  { name: "Betel", initials: "IB", gradient: "linear-gradient(135deg, #0d9488, #0f766e)", online: true },
];
</script>

<style scoped>
.active-churches-card {
  padding: 18px 20px;
}

.card-header {
  margin-bottom: 14px;
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

.churches-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.church-avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.16s ease;
}

.church-avatar-item:hover {
  transform: translateY(-2px);
}

.avatar-bubble {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.online-pulse {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #ffffff;
}

.church-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
