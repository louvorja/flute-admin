<template>
  <div class="stat-card glass-panel" :style="{ '--accent': color }">
    <div class="stat-top">
      <div class="stat-icon-wrap">
        <slot name="icon">
          <span class="default-dot"></span>
        </slot>
      </div>
      <span v-if="tag" class="stat-tag">{{ tag }}</span>
    </div>

    <div class="stat-body">
      <div class="stat-value font-display">{{ formattedValue }}</div>
      <div class="stat-title">{{ title }}</div>
      <div v-if="subtitle" class="stat-subtitle font-mono">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    value: number | string;
    subtitle?: string;
    tag?: string;
    color?: string;
  }>(),
  {
    subtitle: "",
    tag: "",
    color: "#00d2ff",
  }
);

const formattedValue = computed(() => {
  if (typeof props.value === "number") {
    return props.value.toLocaleString("pt-BR");
  }
  return props.value;
});
</script>

<style scoped>
.stat-card {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent);
  opacity: 0.8;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.stat-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.stat-tag {
  font-size: 0.72rem;
  font-family: var(--font-mono);
  color: var(--accent);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.stat-title {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-top: 4px;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 6px;
}

.default-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent);
}
</style>
