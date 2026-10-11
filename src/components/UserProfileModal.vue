<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card card-box">
      <!-- Cabeçalho do Modal -->
      <div class="modal-header">
        <div class="user-header-info">
          <div class="avatar-large">
            <span>{{ avatarInitials }}</span>
          </div>
          <div>
            <h3 class="modal-title">{{ currentName || 'Administrador Louvor JA' }}</h3>
            <p class="modal-subtitle font-mono">
              <span v-if="currentUsername" class="user-handle-badge">@{{ currentUsername }}</span>
              <span>{{ currentEmail }}</span>
            </p>
          </div>
        </div>

        <button class="close-btn" title="Fechar" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Navegação de Abas Internas -->
      <div class="profile-tabs-nav">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'general' }"
          @click="activeTab = 'general'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Dados Gerais</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'security' }"
          @click="activeTab = 'security'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Segurança & Senha</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Conta & Sistema</span>
        </button>
      </div>

      <!-- Feedback de Mensagem (Sucesso ou Erro) -->
      <div v-if="alertMessage" class="alert-box" :class="alertType">
        <svg v-if="alertType === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-svg">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-svg">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ alertMessage }}</span>
      </div>

      <!-- Conteúdo da Aba: DADOS GERAIS -->
      <form v-if="activeTab === 'general'" class="tab-content" @submit.prevent="handleSaveGeneral">
        <!-- Campo: Nome Completo -->
        <div class="form-group">
          <label class="form-label" for="profile-name">Nome do Administrador</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="profile-name"
              v-model="formName"
              type="text"
              class="form-input"
              :disabled="saving"
            />
          </div>
        </div>

        <!-- Campo: Nome de Usuário -->
        <div class="form-group">
          <label class="form-label" for="profile-username">Nome de Usuário (Username)</label>
          <div class="input-wrap">
            <span class="user-at-symbol font-mono">@</span>
            <input
              id="profile-username"
              v-model="formUsername"
              type="text"
              placeholder="usuario"
              class="form-input font-mono"
              :disabled="saving"
              @input="formatUsernameInput"
            />
          </div>
          <span class="hint-msg">
            Identificador exclusivo para login rápido no painel.
          </span>
        </div>

        <!-- Campo: E-mail -->
        <div class="form-group">
          <label class="form-label" for="profile-email">E-mail</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              id="profile-email"
              v-model="formEmail"
              type="email"
              required
              placeholder="admin@louvorja.org"
              class="form-input font-mono"
              :disabled="saving"
            />
          </div>
          <span class="hint-msg">
            O novo e-mail será atualizado diretamente para seu acesso ao painel.
          </span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-save" :disabled="saving">
            <svg v-if="saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning save-svg">
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
            </svg>
            <span>{{ saving ? 'Salvando...' : 'Salvar Alterações' }}</span>
          </button>
        </div>
      </form>

      <!-- Conteúdo da Aba: SEGURANÇA & SENHA -->
      <form v-else-if="activeTab === 'security'" class="tab-content" @submit.prevent="handleSavePassword">
        <div class="form-group">
          <label class="form-label" for="profile-new-pw">Nova Senha de Acesso</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="profile-new-pw"
              v-model="newPassword"
              :type="showNewPw ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="Mínimo de 6 caracteres"
              class="form-input"
              :disabled="saving"
            />
            <button
              type="button"
              class="toggle-pw-btn"
              :title="showNewPw ? 'Ocultar senha' : 'Ver senha'"
              @click="showNewPw = !showNewPw"
            >
              <svg v-if="showNewPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

        <div class="form-group">
          <label class="form-label" for="profile-confirm-pw">Confirmação da Nova Senha</label>
          <div class="input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="profile-confirm-pw"
              v-model="confirmPassword"
              :type="showNewPw ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="Digite a nova senha novamente"
              class="form-input"
              :disabled="saving"
            />
          </div>
          <span v-if="passwordMismatch" class="error-hint">
            As senhas digitadas não coincidem.
          </span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-save" :disabled="saving || passwordMismatch || !newPassword">
            <svg v-if="saving" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning save-svg">
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
            </svg>
            <span>{{ saving ? 'Atualizando...' : 'Atualizar Senha' }}</span>
          </button>
        </div>
      </form>

      <!-- Conteúdo da Aba: CONTA & SISTEMA -->
      <div v-else-if="activeTab === 'account'" class="tab-content">
        <div class="account-details-grid font-mono">
          <div class="account-row">
            <span class="row-label">Nome de Usuário:</span>
            <span class="row-val font-mono highlight-user">@{{ currentUsername || 'N/A' }}</span>
          </div>
          <div class="account-row">
            <span class="row-label">ID de Usuário (UUID):</span>
            <span class="row-val ellipsis-text" :title="profile?.id">{{ profile?.id || 'N/A' }}</span>
          </div>
          <div class="account-row">
            <span class="row-label">Nível de Permissão (Role):</span>
            <span class="row-val badge-role-tag">{{ profile?.role || 'authenticated' }}</span>
          </div>
          <div class="account-row">
            <span class="row-label">Conta Criada Em:</span>
            <span class="row-val">{{ formatDate(profile?.created_at) }}</span>
          </div>
          <div class="account-row">
            <span class="row-label">Último Acesso Registrado:</span>
            <span class="row-val">{{ formatDate(profile?.last_sign_in_at) }}</span>
          </div>
          <div class="account-row">
            <span class="row-label">Provedor de Identidade:</span>
            <span class="row-val">E-mail & Senha (Supabase Auth)</span>
          </div>
        </div>

        <div class="account-footer-notice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <p>
            Sua sessão está vinculada a um token JWT seguro emitido diretamente pelo cluster Postgres do Louvor JA.
          </p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  UserProfile,
  updateUserProfile,
  fetchUserProfile,
} from "../services/supabase";

const props = defineProps<{
  userProfile?: UserProfile | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "profile-updated", user: UserProfile): void;
}>();

const activeTab = ref<"general" | "security" | "account">("general");

const profile = ref<UserProfile | null>(props.userProfile || null);
const formName = ref("");
const formUsername = ref("");
const formEmail = ref("");

const newPassword = ref("");
const confirmPassword = ref("");
const showNewPw = ref(false);

const saving = ref(false);
const alertMessage = ref("");
const alertType = ref<"success" | "error">("success");

const currentName = computed(() => profile.value?.name || formName.value);
const currentUsername = computed(() => profile.value?.username || formUsername.value);
const currentEmail = computed(() => profile.value?.email || formEmail.value);

function formatUsernameInput() {
  formUsername.value = formUsername.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
}

const avatarInitials = computed(() => {
  if (currentName.value) {
    const parts = currentName.value.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return currentName.value.slice(0, 2).toUpperCase();
  }
  if (currentUsername.value) {
    return currentUsername.value.slice(0, 2).toUpperCase();
  }
  if (currentEmail.value) {
    return currentEmail.value.slice(0, 2).toUpperCase();
  }
  return "LJ";
});

const passwordMismatch = computed(() => {
  if (!confirmPassword.value) return false;
  return newPassword.value !== confirmPassword.value;
});

function showAlert(msg: string, type: "success" | "error" = "success") {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => {
    alertMessage.value = "";
  }, 4500);
}

async function handleSaveGeneral() {
  saving.value = true;
  alertMessage.value = "";

  const payload: { name?: string; username?: string; email?: string } = {};
  if (formName.value.trim() !== (profile.value?.name || "")) {
    payload.name = formName.value.trim();
  }
  if (formUsername.value.trim() !== (profile.value?.username || "")) {
    payload.username = formUsername.value.trim();
  }
  if (formEmail.value.trim() !== (profile.value?.email || "")) {
    payload.email = formEmail.value.trim();
  }

  if (Object.keys(payload).length === 0) {
    showAlert("Nenhuma alteração foi realizada.", "success");
    saving.value = false;
    return;
  }

  const res = await updateUserProfile(payload);
  saving.value = false;

  if (res.success) {
    if (res.user) {
      profile.value = res.user;
      emit("profile-updated", res.user);
    }
    showAlert(res.message || "Dados atualizados com sucesso!", "success");
  } else {
    showAlert(res.error || "Erro ao salvar alterações no Supabase.", "error");
  }
}

async function handleSavePassword() {
  if (newPassword.value.length < 6) {
    showAlert("A senha deve conter no mínimo 6 caracteres.", "error");
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    showAlert("As senhas não coincidem.", "error");
    return;
  }

  saving.value = true;
  alertMessage.value = "";

  const res = await updateUserProfile({ password: newPassword.value });
  saving.value = false;

  if (res.success) {
    newPassword.value = "";
    confirmPassword.value = "";
    showAlert("Senha alterada com sucesso!", "success");
  } else {
    showAlert(res.error || "Erro ao atualizar a senha.", "error");
  }
}

function formatDate(iso?: string): string {
  if (!iso) return "N/A";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

onMounted(async () => {
  if (!profile.value) {
    const p = await fetchUserProfile();
    if (p) profile.value = p;
  }
  if (profile.value) {
    formName.value = profile.value.name || "";
    formUsername.value = profile.value.username || "";
    formEmail.value = profile.value.email || "";
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  width: 100%;
  max-width: 540px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  box-shadow: var(--shadow-xl, 0 25px 50px -12px rgba(0, 0, 0, 0.5));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: scaleUp 0.2s ease-out;
}

/* Header */
.modal-header {
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
}

.user-header-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--primary-gradient, linear-gradient(135deg, #0097d7, #0077b6));
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  box-shadow: 0 4px 12px rgba(0, 151, 215, 0.35);
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 2px 0;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--text-light);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-light);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.close-btn:hover {
  background: var(--bg-card);
  color: var(--text-main);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

/* Tabs */
.profile-tabs-nav {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-card);
  gap: 6px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: none;
  border: none;
  border-bottom: 2.5px solid transparent;
  color: var(--text-light);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn svg {
  width: 16px;
  height: 16px;
}

.tab-btn:hover {
  color: var(--text-main);
}

.tab-btn.active {
  color: #0097d7;
  border-bottom-color: #0097d7;
}

/* Alert Box */
.alert-box {
  margin: 16px 24px 0;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  animation: slideDown 0.2s ease-out;
}

.alert-box.success {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.alert-box.error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.alert-svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Tab Content */
.tab-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-main);
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card-subtle);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0 12px;
  height: 42px;
  transition: border-color 0.2s;
}

.input-wrap:focus-within {
  border-color: #0097d7;
}

.input-icon {
  width: 17px;
  height: 17px;
  color: var(--text-light);
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-main);
  font-size: 0.88rem;
}

.toggle-pw-btn {
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.toggle-pw-btn svg {
  width: 16px;
  height: 16px;
}

.hint-msg {
  font-size: 0.74rem;
  color: var(--text-light);
  line-height: 1.4;
  margin-top: 2px;
}

.error-hint {
  font-size: 0.76rem;
  color: #ef4444;
  margin-top: 2px;
}

/* Conta & Sistema */
.account-details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--bg-card-subtle);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid var(--border-light);
  font-size: 0.8rem;
}

.account-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-light);
  gap: 12px;
}

.account-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.row-label {
  color: var(--text-light);
}

.row-val {
  color: var(--text-main);
  font-weight: 600;
  text-align: right;
}

.ellipsis-text {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-role-tag {
  background: rgba(0, 151, 215, 0.12);
  color: #0097d7;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.74rem;
}

.account-footer-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(0, 151, 215, 0.08);
  border: 1px solid rgba(0, 151, 215, 0.2);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.account-footer-notice svg {
  width: 18px;
  height: 18px;
  color: #0097d7;
  flex-shrink: 0;
  margin-top: 1px;
}

.account-footer-notice p {
  margin: 0;
  line-height: 1.4;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}

.btn-cancel {
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: var(--bg-card-subtle);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  color: var(--text-main);
  border-color: var(--text-light);
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-radius: 8px;
  border: none;
  background: #0097d7;
  color: #ffffff;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover:not(:disabled) {
  background: #0081b8;
}

.btn-save:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.save-svg {
  width: 15px;
  height: 15px;
}

.spinning {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-handle-badge {
  display: inline-block;
  font-size: 0.74rem;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  margin-right: 6px;
  font-weight: 700;
}

.user-at-symbol {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
  flex-shrink: 0;
  user-select: none;
}

.highlight-user {
  color: var(--primary);
  font-weight: 700;
}
</style>
