<template>
  <div class="login-wrapper">
    <div class="login-glow"></div>

    <div class="login-card card-box">
      <!-- Cabeçalho / Logo -->
      <div class="login-header">
        <div class="login-logo-box">
          <img src="/logo.svg" alt="Louvor JA" class="login-logo-img" width="50"/>
        </div>
        <div class="header-texts">
          <h1 class="login-title">Louvor JA Flute</h1>
          <p class="login-sub">Painel de Telemetria & Gestão</p>
        </div>
      </div>

      <!-- Alertas de Erro -->
      <div v-if="errorMessage" class="feedback-alert error-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Formulário de Login Administrativo -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- Campo: E-mail ou Nome de Usuário -->
        <div class="form-group">
          <label class="form-label" for="login-identifier">E-mail ou Nome de Usuário</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="login-identifier"
              v-model="loginIdentifier"
              type="text"
              required
              autocomplete="username"
              placeholder="usuario ou seu@email.com"
              class="form-input font-mono"
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Campo: Senha -->
        <div class="form-group">
          <label class="form-label" for="login-password">Senha de Acesso</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="login-password"
              v-model="loginPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••••••"
              class="form-input"
              :disabled="loading"
            />
            <button
              type="button"
              class="toggle-pw-btn"
              :title="showPassword ? 'Ocultar senha' : 'Ver senha'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Botão Entrar -->
        <button type="submit" class="submit-btn" :disabled="loading">
          <svg
            v-if="loading"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="loading-spin"
          >
            <circle cx="12" cy="12" r="10" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <span v-else>Entrar no Painel</span>
        </button>
      </form>

      <!-- Rodapé do Card -->
      <div class="login-footer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="lock-icon">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Acesso restrito à equipe técnica e administradores autorizados.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { signInWithIdentifier } from "../services/supabase";

const emit = defineEmits<{
  (e: "login-success"): void;
}>();

const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Login state
const loginIdentifier = ref("");
const loginPassword = ref("");

async function handleLogin() {
  if (!loginIdentifier.value || !loginPassword.value) {
    errorMessage.value = "Informe seu e-mail ou nome de usuário e sua senha.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await signInWithIdentifier(loginIdentifier.value, loginPassword.value);
    if (res.success) {
      emit("login-success");
    } else {
      errorMessage.value = res.error || "E-mail/usuário ou senha incorretos.";
    }
  } catch (err: any) {
    errorMessage.value = err.message || "Erro inesperado ao conectar ao servidor.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  background-color: var(--bg-app);
  overflow: hidden;
}

.login-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 151, 215, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 36px 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card-hover);
  position: relative;
  z-index: 1;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 28px;
}

.login-logo-box {
  width: 52px;
  height: 52px;
  margin-bottom: 14px;
}

.login-logo-svg {
  width: 100%;
  height: 100%;
}

.badge-role {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--primary);
  background: var(--primary-light);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  display: inline-block;
  margin-bottom: 8px;
}

.login-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.login-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--danger-light);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--danger);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
}

.alert-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  transition: all 0.2s ease;
}

.input-wrap:focus-within {
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px rgba(0, 151, 215, 0.14);
}

.input-icon {
  width: 17px;
  height: 17px;
  color: var(--text-light);
  flex-shrink: 0;
}

.form-input {
  border: none;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: 0.88rem;
  color: var(--text-main);
  width: 100%;
}

.form-input::placeholder {
  color: var(--text-light);
}

.toggle-pw-btn {
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  transition: color 0.16s ease;
}

.toggle-pw-btn:hover {
  color: var(--text-main);
}

.toggle-pw-btn svg {
  width: 17px;
  height: 17px;
}

.submit-btn {
  margin-top: 6px;
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 14px rgba(0, 151, 215, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 151, 215, 0.4);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.loading-spin {
  width: 20px;
  height: 20px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.72rem;
  color: var(--text-light);
  line-height: 1.4;
}

.lock-icon {
  width: 16px;
  height: 16px;
  color: var(--text-light);
  flex-shrink: 0;
}

/* Alertas de Feedback */
.feedback-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 14px;
}

.error-alert {
  background: var(--danger-light);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--danger);
}

.field-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
  line-height: 1.3;
}
</style>
