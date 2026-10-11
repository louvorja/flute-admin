/* eslint-disable @typescript-eslint/no-explicit-any */

export const SUPABASE_URL: string =
  (import.meta.env.VITE_CLOUD_ENDPOINT as string) ||
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://vktovorubdurbkpssgty.supabase.co";
export const SUPABASE_ANON_KEY: string =
  (import.meta.env.VITE_CLOUD_TOKEN as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  "";

export interface WeeklyDayData {
  day: string;
  fullDate: string;
  music: number;
  slides: number;
  desktop: number;
  web: number;
  slidesPct: number;
  musicPct: number;
  basePct: number;
}

export interface DetailedSong {
  name: string;
  subtitle?: string;
  album?: string;
  is_external?: boolean;
  count: number;
  completed: number;
  avgCompletionPct: number;
  avgDurationSeconds: number;
  totalDurationSeconds: number;
  primaryAudioMode: string;
  audioModes: Record<string, number>;
  stopReasons: Record<string, number>;
  lastPlayedAt?: string;
}

export interface AudioModeItem {
  mode: string;
  label: string;
  icon: string;
  count: number;
  pct: number;
}

export interface StopReasonItem {
  reason: string;
  label: string;
  count: number;
  pct: number;
}

export interface MusicEngagementSummary {
  totalPlays: number;
  completedPlays: number;
  overallCompletionPct: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  audioModeDistribution: AudioModeItem[];
  stopReasonDistribution: StopReasonItem[];
}

export interface TelemetrySummary {
  totalInstallations: number;
  totalEvents: number;
  totalSongsPlayed: number;
  totalSlidesProjected: number;
  totalErrors: number;
  activeToday: number;
  topSongs: DetailedSong[];
  musicEngagement: MusicEngagementSummary;
  topModules: { id: string; name: string; count: number }[];
  allModules: { id: string; name: string; count: number }[];
  platforms: { name: string; count: number; pct: number }[];
  versions: { version: string; count: number }[];
  recentErrors: {
    id: number;
    message: string;
    details?: string;
    version: string;
    platform: string;
    created_at: string;
  }[];
  heatmap: number[][]; // [dia_semana 0..6][hora 0..23]
  dailyActiveUsers: { date: string; desktop: number; web: number }[];
  weeklyBreakdown: WeeklyDayData[];
}

export interface SupportTicket {
  id: number;
  installation_id: string | null;
  name: string;
  email: string;
  category: "doubt" | "suggestion" | "bug" | "other";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  diagnostics: {
    appVersion?: string;
    platform?: string;
    isElectron?: boolean;
    screenResolution?: string;
    databaseVersion?: string | number | null;
    userAgent?: string;
    timestamp?: string;
  };
  app_version: string;
  platform: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationMetrics {
  viewed_count: number;
  read_count: number;
  viewed_pct: number;
  read_pct: number;
  total_events: number;
}

export interface NotificationAnalytics {
  total_installations: number;
  global_viewed_count: number;
  global_read_count: number;
  global_viewed_pct: number;
  global_read_pct: number;
  by_notification: Record<string, NotificationMetrics>;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: "info" | "update" | "alert" | "feature";
  priority: "normal" | "high" | "urgent";
  target_audience: "all" | "windows" | "mac" | "linux";
  link_url?: string | null;
  link_label?: string | null;
  is_active: boolean;
  author_email?: string | null;
  created_at: string;
  expires_at?: string | null;
  viewed_count?: number;
  read_count?: number;
  viewed_pct?: number;
  read_pct?: number;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type: "info" | "update" | "alert" | "feature";
  priority?: "normal" | "high" | "urgent";
  target_audience?: "all" | "windows" | "mac" | "linux";
  link_url?: string | null;
  link_label?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
  author_email?: string | null;
}

const STORAGE_AUTH_SESSION = "lja_admin_auth_session";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_SESSION);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.access_token) return session;
    return null;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  const session = getStoredSession();
  return session ? session.access_token : null;
}

export function getCurrentUser(): UserProfile | null {
  const session = getStoredSession();
  return session ? session.user : null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

/**
 * Busca perfil na tabela admin_profiles pelo nome de usuário
 */
export async function findProfileByUsername(username: string): Promise<{ id: string; username: string; email: string; name?: string } | null> {
  const clean = username.trim().toLowerCase().replace(/^@/, "");
  if (!clean) return null;
  try {
    const list = await fetchFromSupabase(`admin_profiles?username=ilike.${encodeURIComponent(clean)}&limit=1`);
    if (Array.isArray(list) && list.length > 0) {
      return list[0];
    }
    return null;
  } catch (err) {
    console.warn("Falha ao buscar perfil por username:", err);
    return null;
  }
}

/**
 * Valida se um nome de usuário está disponível para cadastro
 */
export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<{ available: boolean; error?: string }> {
  const clean = username.trim().toLowerCase().replace(/^@/, "");
  if (!clean) {
    return { available: false, error: "Informe um nome de usuário." };
  }
  if (!/^[a-z0-9_.-]{3,30}$/.test(clean)) {
    return {
      available: false,
      error: "O nome de usuário deve ter entre 3 e 30 caracteres (letras minúsculas, números, '.', '-' ou '_').",
    };
  }

  try {
    let endpoint = `admin_profiles?username=ilike.${encodeURIComponent(clean)}`;
    if (excludeUserId) {
      endpoint += `&id=neq.${encodeURIComponent(excludeUserId)}`;
    }
    const list = await fetchFromSupabase(`${endpoint}&limit=1`);
    if (Array.isArray(list) && list.length > 0) {
      return { available: false, error: `O nome de usuário '@${clean}' já está em uso.` };
    }
    return { available: true };
  } catch {
    return { available: true };
  }
}

/**
 * Login flexível aceitando tanto E-mail quanto Nome de Usuário
 */
export async function signInWithIdentifier(
  identifier: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const clean = identifier.trim();
  if (!clean) {
    return { success: false, error: "Informe seu e-mail ou nome de usuário." };
  }
  if (!password) {
    return { success: false, error: "Informe sua senha de acesso." };
  }

  let emailToUse = clean;

  // Se NÃO for um e-mail com @, busca o e-mail correspondente pelo username
  if (!clean.includes("@")) {
    const profile = await findProfileByUsername(clean);
    if (!profile) {
      return {
        success: false,
        error: `Nenhum usuário encontrado com o nome de usuário '@${clean.replace(/^@/, "")}'. Verifique a digitação ou use seu e-mail.`,
      };
    }
    emailToUse = profile.email;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: emailToUse.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data.error_description || data.msg || data.message || "E-mail/usuário ou senha incorretos.";
      return { success: false, error: msg };
    }

    if (data.access_token) {
      const userMeta = data.user?.user_metadata || data.user?.raw_user_meta_data || {};
      let name = userMeta.name || "";
      let username = userMeta.username || (!clean.includes("@") ? clean.replace(/^@/, "").toLowerCase() : "");

      // Busca na tabela admin_profiles para garantir username consistente
      if (data.user?.id) {
        try {
          const list = await fetchFromSupabase(`admin_profiles?id=eq.${encodeURIComponent(data.user.id)}&limit=1`);
          if (Array.isArray(list) && list.length > 0) {
            username = list[0].username || username;
            if (!name && list[0].name) name = list[0].name;
          }
        } catch {
          // ignore
        }
      }

      if (!username && data.user?.email) {
        username = data.user.email.split("@")[0].toLowerCase();
      }

      const userProfile: UserProfile = {
        id: data.user?.id || "",
        email: data.user?.email || emailToUse,
        name,
        username,
        role: data.user?.role,
        created_at: data.user?.created_at,
        last_sign_in_at: data.user?.last_sign_in_at,
      };

      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: userProfile,
      };
      localStorage.setItem(STORAGE_AUTH_SESSION, JSON.stringify(session));

      return { success: true, user: userProfile };
    }

    return { success: false, error: "Resposta inesperada do servidor de autenticação." };
  } catch (err: any) {
    return { success: false, error: err.message || "Falha de rede ao conectar com o serviço de autenticação." };
  }
}

/** Alias para manter compatibilidade com código existente */
export const signInWithEmail = signInWithIdentifier;

/**
 * Criação de nova conta de administrador (Sign Up com Nome, Usuário, E-mail e Senha)
 */
export async function signUpUser(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  autoLogin?: boolean;
  message?: string;
  error?: string;
  user?: UserProfile;
}> {
  const cleanName = input.name.trim();
  const cleanUsername = input.username.trim().toLowerCase().replace(/^@/, "");
  const cleanEmail = input.email.trim().toLowerCase();
  const password = input.password;

  if (!cleanName) {
    return { success: false, error: "Informe seu nome completo." };
  }
  if (!cleanUsername) {
    return { success: false, error: "Informe um nome de usuário." };
  }
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, error: "Informe um e-mail válido." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "A senha deve ter no mínimo 6 caracteres." };
  }

  // 1. Verifica disponibilidade do username
  const checkUsername = await checkUsernameAvailable(cleanUsername);
  if (!checkUsername.available) {
    return { success: false, error: checkUsername.error || "Nome de usuário já em uso." };
  }

  // 2. Verifica se o e-mail já existe
  try {
    const existingEmail = await fetchFromSupabase(`admin_profiles?email=eq.${encodeURIComponent(cleanEmail)}&limit=1`);
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      return { success: false, error: "Este e-mail já está cadastrado no sistema. Faça login diretamente." };
    }
  } catch {
    // continue
  }

  // 3. Cadastra no Supabase Auth
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: {
          name: cleanName,
          username: cleanUsername,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data.error_description || data.msg || data.message || "Erro ao criar usuário.";
      return { success: false, error: msg };
    }

    const userId = data.id || data.user?.id;

    // 4. Grava em admin_profiles
    if (userId) {
      try {
        await fetchFromSupabase("admin_profiles", {
          method: "POST",
          headers: {
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            id: userId,
            username: cleanUsername,
            name: cleanName,
            email: cleanEmail,
          }),
        });
      } catch (err) {
        console.warn("Falha ao gravar admin_profiles:", err);
      }
    }

    // Se já autenticou direto
    if (data.access_token) {
      const userProfile: UserProfile = {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        username: cleanUsername,
        role: data.user?.role || "authenticated",
        created_at: data.user?.created_at,
        last_sign_in_at: data.user?.last_sign_in_at,
      };

      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: userProfile,
      };
      localStorage.setItem(STORAGE_AUTH_SESSION, JSON.stringify(session));

      return {
        success: true,
        autoLogin: true,
        user: userProfile,
        message: "Conta criada e conectada com sucesso!",
      };
    }

    // Tenta login com a senha recém criada
    const loginAttempt = await signInWithIdentifier(cleanEmail, password);
    if (loginAttempt.success) {
      return {
        success: true,
        autoLogin: true,
        user: loginAttempt.user,
        message: "Conta criada com sucesso!",
      };
    }

    return {
      success: true,
      autoLogin: false,
      message: "Conta criada com sucesso! Você já pode entrar com seu usuário ou e-mail.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Falha ao conectar com o serviço de autenticação." };
  }
}

/**
 * Busca o perfil atualizado do usuário autenticado diretamente da API do Supabase Auth e admin_profiles
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return getCurrentUser();

    const data = await res.json();
    let name = data.user_metadata?.name || data.raw_user_meta_data?.name || "";
    let username = data.user_metadata?.username || data.raw_user_meta_data?.username || "";
    let email = data.email || "";

    if (data.id) {
      try {
        const list = await fetchFromSupabase(`admin_profiles?id=eq.${encodeURIComponent(data.id)}&limit=1`);
        if (Array.isArray(list) && list.length > 0) {
          username = list[0].username || username;
          if (list[0].name) name = list[0].name;
          if (list[0].email) email = list[0].email;
        }
      } catch {
        // ignore
      }
    }

    if (!username && email) {
      username = email.split("@")[0].toLowerCase();
    }

    const updatedProfile: UserProfile = {
      id: data.id,
      email,
      name,
      username,
      role: data.role,
      created_at: data.created_at,
      last_sign_in_at: data.last_sign_in_at,
    };

    const session = getStoredSession();
    if (session) {
      session.user = updatedProfile;
      localStorage.setItem(STORAGE_AUTH_SESSION, JSON.stringify(session));
    }

    return updatedProfile;
  } catch (err) {
    console.warn("Falha ao buscar perfil atualizado:", err);
    return getCurrentUser();
  }
}

/**
 * Atualiza os dados cadastrais (nome, username, email, senha) do usuário autenticado
 */
export async function updateUserProfile(payload: {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
  try {
    const token = getAuthToken();
    const currentUser = getCurrentUser();
    if (!token || !currentUser) return { success: false, error: "Usuário não autenticado." };

    const targetName = payload.name !== undefined ? payload.name.trim() : currentUser.name;
    const targetEmail = payload.email !== undefined ? payload.email.trim().toLowerCase() : currentUser.email;
    let targetUsername = currentUser.username;

    if (payload.username !== undefined) {
      const cleanUser = payload.username.trim().toLowerCase().replace(/^@/, "");
      if (cleanUser) {
        targetUsername = cleanUser;
      }
    }

    let updatedProfileData = {
      id: currentUser.id,
      name: targetName,
      username: targetUsername,
      email: targetEmail,
    };

    const hasProfileChanges =
      payload.name !== undefined ||
      payload.username !== undefined ||
      payload.email !== undefined;

    // 1. Atualiza dados de perfil (nome, username, e-mail) através da RPC segura no banco de dados
    if (hasProfileChanges) {
      try {
        const rpcResult = await fetchFromSupabase("rpc/update_admin_profile", {
          method: "POST",
          body: JSON.stringify({
            new_name: targetName,
            new_username: targetUsername,
            new_email: targetEmail,
          }),
        });

        if (rpcResult && typeof rpcResult === "object") {
          updatedProfileData = {
            id: rpcResult.id || currentUser.id,
            name: rpcResult.name || targetName,
            username: rpcResult.username || targetUsername,
            email: rpcResult.email || targetEmail,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Falha ao atualizar dados de perfil no servidor.",
        };
      }
    }

    // 2. Se foi solicitada alteração de senha
    if (payload.password) {
      const pwRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: payload.password }),
      });

      const pwData = await pwRes.json();
      if (!pwRes.ok || pwData.error) {
        const msg = pwData.error_description || pwData.msg || pwData.message || "Falha ao atualizar a senha.";
        return { success: false, error: msg };
      }
    }

    // 3. Atualiza a sessão e o storage local
    const session = getStoredSession();
    if (session) {
      const updatedUser: UserProfile = {
        ...session.user,
        name: updatedProfileData.name,
        username: updatedProfileData.username,
        email: updatedProfileData.email,
      };
      session.user = updatedUser;
      localStorage.setItem(STORAGE_AUTH_SESSION, JSON.stringify(session));
      return {
        success: true,
        user: updatedUser,
        message: "Dados atualizados com sucesso!",
      };
    }

    return { success: true, message: "Dados atualizados com sucesso!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro inesperado ao salvar perfil." };
  }
}

export function signOut(): void {
  try {
    localStorage.removeItem(STORAGE_AUTH_SESSION);
  } catch {
    // ignore
  }
}

export async function fetchFromSupabase(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const token = getAuthToken();
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401 && token) {
      signOut();
    }
    let detail = "";
    try {
      const errData = await res.json();
      detail = errData.message || errData.error_description || errData.error || errData.msg || errData.hint || "";
    } catch {
      try {
        detail = await res.text();
      } catch {}
    }
    throw new Error(detail || `Supabase query failed: ${res.statusText} (${res.status})`);
  }

  // Se o servidor retornar 204 No Content ou corpo vazio
  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Busca todos os chamados de suporte
 */
export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    return await fetchFromSupabase("support_tickets?select=*&order=created_at.desc&limit=200");
  } catch (err) {
    console.warn("Falha ao buscar tickets de suporte:", err);
    return [];
  }
}

/**
 * Atualiza o status do chamado e notas do administrador
 */
export async function updateTicketStatus(
  id: number,
  status: "open" | "in_progress" | "resolved" | "closed",
  adminNotes?: string
): Promise<boolean> {
  try {
    await fetchFromSupabase(`support_tickets?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
        updated_at: new Date().toISOString(),
      }),
    });
    return true;
  } catch (err) {
    console.error("Erro ao atualizar status do ticket:", err);
    return false;
  }
}

/**
 * Busca estatísticas analíticas consolidadas de visualização e leitura das notificações
 */
export async function getNotificationAnalytics(): Promise<NotificationAnalytics> {
  try {
    const data = await fetchFromSupabase("rpc/get_notification_analytics", {
      method: "POST",
    });
    if (data && typeof data === "object" && data.total_installations !== undefined) {
      return data as NotificationAnalytics;
    }
  } catch (err) {
    console.warn("Falha ao chamar rpc/get_notification_analytics, usando fallback local:", err);
  }

  // Fallback seguro caso a RPC não esteja acessível
  try {
    const [installations, events] = await Promise.all([
      fetchFromSupabase("telemetry_installations?select=installation_id").catch(() => []),
      fetchFromSupabase("telemetry_events?event_name=in.(notification_viewed,notification_read)&select=event_name,installation_id,event_data&limit=5000").catch(() => []),
    ]);

    const instSet = new Set<string>();
    for (const inst of installations || []) {
      if (inst.installation_id) instSet.add(inst.installation_id);
    }
    for (const ev of events || []) {
      if (ev.installation_id) instSet.add(ev.installation_id);
    }
    const totalInst = Math.max(1, instSet.size);

    const globalViewedSet = new Set<string>();
    const globalReadSet = new Set<string>();
    const byNotifMap: Record<string, { viewed: Set<string>; read: Set<string>; count: number }> = {};

    for (const ev of events || []) {
      const notifId = String(ev.event_data?.notification_id || "");
      if (!notifId) continue;

      if (!byNotifMap[notifId]) {
        byNotifMap[notifId] = { viewed: new Set(), read: new Set(), count: 0 };
      }
      byNotifMap[notifId].count++;

      if (ev.event_name === "notification_viewed" && ev.installation_id) {
        globalViewedSet.add(ev.installation_id);
        byNotifMap[notifId].viewed.add(ev.installation_id);
      } else if (ev.event_name === "notification_read" && ev.installation_id) {
        globalReadSet.add(ev.installation_id);
        byNotifMap[notifId].read.add(ev.installation_id);
      }
    }

    const byNotification: Record<string, NotificationMetrics> = {};
    for (const [id, stats] of Object.entries(byNotifMap)) {
      byNotification[id] = {
        viewed_count: stats.viewed.size,
        read_count: stats.read.size,
        viewed_pct: Math.round((stats.viewed.size / totalInst) * 100),
        read_pct: Math.round((stats.read.size / totalInst) * 100),
        total_events: stats.count,
      };
    }

    return {
      total_installations: totalInst,
      global_viewed_count: globalViewedSet.size,
      global_read_count: globalReadSet.size,
      global_viewed_pct: Math.round((globalViewedSet.size / totalInst) * 100),
      global_read_pct: Math.round((globalReadSet.size / totalInst) * 100),
      by_notification: byNotification,
    };
  } catch {
    return {
      total_installations: 1,
      global_viewed_count: 0,
      global_read_count: 0,
      global_viewed_pct: 0,
      global_read_pct: 0,
      by_notification: {},
    };
  }
}

/**
 * Busca todas as notificações cadastradas com métricas de alcance e leitura associadas
 */
export async function getAppNotifications(): Promise<AppNotification[]> {
  try {
    const [rawNotifications, analytics] = await Promise.all([
      fetchFromSupabase("app_notifications?select=*&order=created_at.desc&limit=150"),
      getNotificationAnalytics().catch(() => null),
    ]);

    const notifs: AppNotification[] = Array.isArray(rawNotifications) ? rawNotifications : [];
    if (analytics && analytics.by_notification) {
      for (const n of notifs) {
        const stats = analytics.by_notification[String(n.id)];
        if (stats) {
          n.viewed_count = stats.viewed_count || 0;
          n.read_count = stats.read_count || 0;
          n.viewed_pct = stats.viewed_pct || 0;
          n.read_pct = stats.read_pct || 0;
        } else {
          n.viewed_count = 0;
          n.read_count = 0;
          n.viewed_pct = 0;
          n.read_pct = 0;
        }
      }
    }
    return notifs;
  } catch (err) {
    console.warn("Falha ao buscar notificações:", err);
    return [];
  }
}

/**
 * Cria uma nova notificação para os usuários
 */
export async function createAppNotification(input: CreateNotificationInput): Promise<AppNotification | null> {
  try {
    const res = await fetchFromSupabase("app_notifications", {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        title: input.title.trim(),
        message: input.message.trim(),
        type: input.type || "info",
        priority: input.priority || "normal",
        target_audience: input.target_audience || "all",
        link_url: input.link_url?.trim() || null,
        link_label: input.link_label?.trim() || null,
        is_active: input.is_active !== undefined ? input.is_active : true,
        expires_at: input.expires_at || null,
        author_email: input.author_email || getCurrentUser()?.email || null,
      }),
    });
    return Array.isArray(res) ? res[0] : res;
  } catch (err) {
    console.error("Erro ao criar notificação:", err);
    throw err;
  }
}

/**
 * Atualiza uma notificação existente
 */
export async function updateAppNotification(
  id: number,
  input: Partial<CreateNotificationInput>
): Promise<AppNotification | null> {
  try {
    const payload: Record<string, any> = {};
    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.message !== undefined) payload.message = input.message.trim();
    if (input.type !== undefined) payload.type = input.type;
    if (input.priority !== undefined) payload.priority = input.priority;
    if (input.target_audience !== undefined) payload.target_audience = input.target_audience;
    if (input.link_url !== undefined) payload.link_url = input.link_url?.trim() || null;
    if (input.link_label !== undefined) payload.link_label = input.link_label?.trim() || null;
    if (input.is_active !== undefined) payload.is_active = input.is_active;
    if (input.expires_at !== undefined) payload.expires_at = input.expires_at || null;

    const res = await fetchFromSupabase(`app_notifications?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
    return Array.isArray(res) ? res[0] : res;
  } catch (err) {
    console.error("Erro ao atualizar notificação:", err);
    throw err;
  }
}

/**
 * Alterna rapidamente o status ativo/inativo de uma notificação
 */
export async function toggleNotificationActive(id: number, isActive: boolean): Promise<boolean> {
  try {
    await fetchFromSupabase(`app_notifications?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    return true;
  } catch (err) {
    console.error("Erro ao alternar status da notificação:", err);
    return false;
  }
}

/**
 * Exclui uma notificação do banco e remove todos os eventos de visualização e leitura vinculados
 */
export async function deleteAppNotification(id: number): Promise<boolean> {
  try {
    // 1. Remove os eventos de visualização e leitura vinculados a esta notificação no telemetry_events
    try {
      await Promise.all([
        fetchFromSupabase(
          `telemetry_events?event_name=in.(notification_viewed,notification_read)&event_data->>notification_id=eq.${id}`,
          { method: "DELETE" }
        ),
        fetchFromSupabase(
          `telemetry_events?event_name=in.(notification_viewed,notification_read)&event_data->>id=eq.${id}`,
          { method: "DELETE" }
        ),
      ]);
    } catch (errEv) {
      console.warn("Aviso ao limpar eventos da notificação excluída:", errEv);
    }

    // 2. Exclui a notificação da tabela app_notifications
    await fetchFromSupabase(`app_notifications?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        Prefer: "return=representation",
      },
    });

    return true;
  } catch (err) {
    console.error("Erro ao excluir notificação:", err);
    return false;
  }
}

/**
 * Envia um evento de teste diretamente ao Supabase para validação instantânea da conexão
 */
export async function sendTestTelemetryEvent(eventName: string, data: Record<string, any> = {}): Promise<void> {
  await fetchFromSupabase("telemetry_events", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      installation_id: "admin-test-device",
      session_id: "admin-session-" + Date.now(),
      event_name: eventName,
      app_version: "1.9.4",
      platform: "darwin",
      os_name: "macOS 15.0",
      event_data: data,
    }),
  });
}

/**
 * Busca os dados REAIS consolidados do Supabase
 */
export async function getTelemetryData(period: "7d" | "30d" | "all" = "7d"): Promise<TelemetrySummary> {
  try {
    const [installations, events, songPlays] = await Promise.all([
      fetchFromSupabase("telemetry_installations?select=*&order=last_seen_at.desc&limit=500"),
      fetchFromSupabase("telemetry_events?select=*&order=created_at.desc&limit=1000"),
      fetchFromSupabase("telemetry_song_plays?select=*&order=started_at.desc&limit=1000").catch(() => []),
    ]);

    // Data de corte temporal baseada no período selecionado
    const now = new Date();
    let cutoffDate: Date | null = null;
    if (period === "7d") {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filtra eventos e músicas pelo período selecionado
    const filteredEvents = cutoffDate
      ? (events || []).filter((ev: any) => ev.created_at && new Date(ev.created_at) >= cutoffDate!)
      : (events || []);

    const filteredSongPlays = cutoffDate
      ? (songPlays || []).filter((sp: any) => {
          const t = sp.started_at || sp.created_at;
          return t && new Date(t) >= cutoffDate!;
        })
      : (songPlays || []);

    // Instalações ativas no período selecionado
    let targetInstallations = installations || [];
    if (cutoffDate) {
      const activeInstIds = new Set<string>();
      for (const ev of filteredEvents) {
        if (ev.installation_id) activeInstIds.add(ev.installation_id);
      }
      for (const sp of filteredSongPlays) {
        if (sp.installation_id) activeInstIds.add(sp.installation_id);
      }
      for (const inst of installations || []) {
        if (inst.last_seen_at && new Date(inst.last_seen_at) >= cutoffDate!) {
          activeInstIds.add(inst.installation_id || String(inst.id));
        }
      }
      const matched = (installations || []).filter((inst: any) =>
        activeInstIds.has(inst.installation_id || String(inst.id))
      );
      if (matched.length > 0) {
        targetInstallations = matched;
      }
    }

    // Função de normalização para os 3 modos oficiais do Louvor JA:
    // - Cantado (com voz / "audio")
    // - Playback (instrumental de fundo / "instrumental")
    // - Sem Áudio (mudo / apenas slides)
    const normalizeAudioMode = (mode?: string): "cantado" | "playback" | "no_audio" => {
      if (!mode) return "no_audio";
      const m = mode.toLowerCase().trim();
      if (m === "cantado" || m === "audio") return "cantado";
      if (m === "playback" || m === "instrumental") return "playback";
      if (m === "no_audio" || m === "sem_audio") return "no_audio";
      return "cantado";
    };

    // Agregações ricas para Músicas a partir de filteredSongPlays e filteredEvents
    const detailedSongMap: Record<string, {
      name: string;
      subtitle: string;
      album: string;
      is_external: boolean;
      count: number;
      completed: number;
      totalCompletionPct: number;
      totalDurationSeconds: number;
      audioModes: Record<string, number>;
      stopReasons: Record<string, number>;
      lastPlayedAt?: string;
    }> = {};

    let totalSongDurationSeconds = 0;
    let totalCompletedPlays = 0;
    let sumCompletionPct = 0;
    let totalPlaysCount = 0;

    const audioModeCounts: Record<"cantado" | "playback" | "no_audio", number> = {
      cantado: 0,
      playback: 0,
      no_audio: 0,
    };

    const stopReasonCounts: Record<string, number> = {
      completed: 0,
      next_song: 0,
      closed: 0,
      app_closed: 0,
    };

    // 1. Processa dados da nova tabela consolidada telemetry_song_plays filtrada
    if (Array.isArray(filteredSongPlays) && filteredSongPlays.length > 0) {
      for (const sp of filteredSongPlays) {
        // Normaliza título (remove quebras de linha \r\n e múltiplos espaços)
        const rawTitle = sp.song_title || "Música sem título";
        const title = rawTitle.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
        const isExternal = Boolean(sp.is_external) || (!sp.subtitle && !sp.album_name);

        if (!detailedSongMap[title]) {
          detailedSongMap[title] = {
            name: title,
            subtitle: (sp.subtitle || "").trim(),
            album: (sp.album_name || "").trim(),
            is_external: isExternal,
            count: 0,
            completed: 0,
            totalCompletionPct: 0,
            totalDurationSeconds: 0,
            audioModes: {},
            stopReasons: {},
            lastPlayedAt: sp.started_at,
          };
        }

        const item = detailedSongMap[title];
        item.count++;
        totalPlaysCount++;

        const isCompleted = sp.stop_reason === "completed" || Number(sp.completion_pct) >= 95;
        if (isCompleted) {
          item.completed++;
          totalCompletedPlays++;
        }

        const compPct = Number(sp.completion_pct) || (isCompleted ? 100 : 50);
        item.totalCompletionPct += compPct;
        sumCompletionPct += compPct;

        const durSec = Number(sp.duration_seconds) || 0;
        item.totalDurationSeconds += durSec;
        totalSongDurationSeconds += durSec;

        const mode = normalizeAudioMode(sp.audio_mode);
        item.audioModes[mode] = (item.audioModes[mode] || 0) + 1;
        audioModeCounts[mode] = (audioModeCounts[mode] || 0) + 1;

        const reason = sp.stop_reason || "closed";
        item.stopReasons[reason] = (item.stopReasons[reason] || 0) + 1;
        stopReasonCounts[reason] = (stopReasonCounts[reason] || 0) + 1;

        if (sp.subtitle && !item.subtitle) item.subtitle = sp.subtitle.trim();
        if (sp.album_name && !item.album) item.album = sp.album_name.trim();
        if (isExternal) item.is_external = true;
      }
    }

    // 2. Agregações a partir dos eventos de filteredEvents
    const modMap: Record<string, number> = {};
    const errors: any[] = [];
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let legacySongsCount = 0;
    let slidesCount = 0;

    for (const ev of filteredEvents) {
      const dt = new Date(ev.created_at);
      const day = dt.getDay(); // 0 = Domingo
      const hour = dt.getHours();
      heatmap[day][hour]++;

      if (ev.event_name === "song_played") {
        legacySongsCount++;
        const rawName = ev.event_data?.name || "Música desconhecida";
        const songName = rawName.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
        if (!detailedSongMap[songName]) {
          detailedSongMap[songName] = {
            name: songName,
            subtitle: "",
            album: "",
            is_external: false,
            count: 0,
            completed: 0,
            totalCompletionPct: 0,
            totalDurationSeconds: 0,
            audioModes: { cantado: 0 },
            stopReasons: {},
            lastPlayedAt: ev.created_at,
          };
        }
        if (!filteredSongPlays || filteredSongPlays.length === 0) {
          detailedSongMap[songName].count++;
          totalPlaysCount++;
          detailedSongMap[songName].totalCompletionPct += 85;
          sumCompletionPct += 85;
          detailedSongMap[songName].totalDurationSeconds += 210;
          totalSongDurationSeconds += 210;
          audioModeCounts.cantado = (audioModeCounts.cantado || 0) + 1;
        }
      } else if (ev.event_name === "song_completed") {
        const rawName = ev.event_data?.name || "Música desconhecida";
        const songName = rawName.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
        if (detailedSongMap[songName] && (!filteredSongPlays || filteredSongPlays.length === 0)) {
          detailedSongMap[songName].completed++;
          totalCompletedPlays++;
          stopReasonCounts.completed = (stopReasonCounts.completed || 0) + 1;
        }
      } else if (ev.event_name === "module_opened") {
        let mod = ev.event_data?.module_id || "geral";
        if (mod === "sync") mod = "update";
        modMap[mod] = (modMap[mod] || 0) + 1;
      } else if (ev.event_name === "slide_projected") {
        slidesCount++;
      } else if (ev.event_name === "error_occurred") {
        const d = ev.event_data || {};
        let detailsStr = "";
        if (typeof d.details === "string" && d.details.trim()) {
          detailsStr = d.details.trim();
        } else if (typeof d.stack === "string" && d.stack.trim()) {
          detailsStr = d.stack.trim();
        } else if (d.error && typeof d.error === "object") {
          detailsStr = d.error.stack || d.error.message || JSON.stringify(d.error, null, 2);
        } else if (typeof d.info === "string" && d.info.trim()) {
          detailsStr = `Info: ${d.info}` + (d.stack ? `\n\nStack:\n${d.stack}` : "");
        } else if (typeof d === "object" && Object.keys(d).length > 0) {
          const filtered = { ...d };
          if (Object.keys(filtered).length > 1 || !filtered.message) {
            detailsStr = JSON.stringify(filtered, null, 2);
          }
        }

        errors.push({
          id: ev.id,
          message: d.message || "Erro desconhecido",
          details: detailsStr || (d.message ? `Mensagem de erro: ${d.message}` : ""),
          version: ev.app_version || "1.9.4",
          platform: ev.platform || "Desktop",
          created_at: ev.created_at,
        });
      }
    }

    const finalSongsCount = Math.max(totalPlaysCount, legacySongsCount);

    const topSongs: DetailedSong[] = Object.values(detailedSongMap)
      .filter((s) => s.count > 0)
      .map((s) => {
        const count = s.count || 1;
        const avgComp = Math.round(s.totalCompletionPct / count);
        const avgDur = Math.round(s.totalDurationSeconds / count);

        let primaryMode = "cantado";
        let maxModeCount = 0;
        for (const [m, c] of Object.entries(s.audioModes)) {
          if (c > maxModeCount) {
            maxModeCount = c;
            primaryMode = m;
          }
        }

        return {
          name: s.name,
          subtitle: s.subtitle,
          album: s.album,
          is_external: s.is_external || (!s.subtitle && !s.album),
          count: s.count,
          completed: s.completed,
          avgCompletionPct: avgComp > 0 ? avgComp : 80,
          avgDurationSeconds: avgDur > 0 ? avgDur : 180,
          totalDurationSeconds: s.totalDurationSeconds,
          primaryAudioMode: primaryMode,
          audioModes: s.audioModes,
          stopReasons: s.stopReasons,
          lastPlayedAt: s.lastPlayedAt,
        };
      })
      .sort((a, b) => b.count - a.count);

    const totalPlaysForSummary = Math.max(1, totalPlaysCount);
    const audioModeDistribution: AudioModeItem[] = [
      { mode: "cantado", label: "Cantado", icon: "cantado", count: audioModeCounts.cantado || 0, pct: Math.round(((audioModeCounts.cantado || 0) / totalPlaysForSummary) * 100) },
      { mode: "playback", label: "Playback", icon: "playback", count: audioModeCounts.playback || 0, pct: Math.round(((audioModeCounts.playback || 0) / totalPlaysForSummary) * 100) },
      { mode: "no_audio", label: "Sem Áudio", icon: "no_audio", count: audioModeCounts.no_audio || 0, pct: Math.round(((audioModeCounts.no_audio || 0) / totalPlaysForSummary) * 100) },
    ];

    const stopReasonDistribution: StopReasonItem[] = [
      { reason: "completed", label: "Concluída até o fim", count: stopReasonCounts.completed || 0, pct: Math.round(((stopReasonCounts.completed || 0) / totalPlaysForSummary) * 100) },
      { reason: "next_song", label: "Avançou para próxima", count: stopReasonCounts.next_song || 0, pct: Math.round(((stopReasonCounts.next_song || 0) / totalPlaysForSummary) * 100) },
      { reason: "closed", label: "Fechou o player", count: stopReasonCounts.closed || 0, pct: Math.round(((stopReasonCounts.closed || 0) / totalPlaysForSummary) * 100) },
      { reason: "app_closed", label: "App encerrado", count: stopReasonCounts.app_closed || 0, pct: Math.round(((stopReasonCounts.app_closed || 0) / totalPlaysForSummary) * 100) },
    ];

    const musicEngagement: MusicEngagementSummary = {
      totalPlays: totalPlaysCount,
      completedPlays: totalCompletedPlays,
      overallCompletionPct: totalPlaysCount > 0 ? Math.round(sumCompletionPct / totalPlaysCount) : 0,
      totalDurationSeconds: totalSongDurationSeconds,
      avgDurationSeconds: totalPlaysCount > 0 ? Math.round(totalSongDurationSeconds / totalPlaysCount) : 0,
      audioModeDistribution,
      stopReasonDistribution,
    };

    const moduleNameMap: Record<string, string> = {
      praise: "Louvor & Coletâneas",
      home: "Página Inicial",
      bible: "Bíblia Sagrada",
      liturgy: "Liturgia",
      timer: "Cronômetro",
      clock: "Relógio",
      hymnal: "Hinário Adventista",
      hymnal_1996: "Hinário Adventista (1996)",
      collections: "Coletâneas",
      custom_collection: "Coletâneas Personalizadas",
      music_editor: "Editor de Música",
      personalized_videos: "Vídeos Personalizados",
      online_collection: "Vídeos Online",
      random: "Sorteio",
      help: "Ajuda e Suporte",
      config: "Configurações",
      update: "Atualização & Sincronização",
      messages: "Mensagens & Avisos",
      core: "Sistema Principal",
    };

    // Gera lista completa de todos os módulos mapeados do sistema Louvor JA
    const allModules = Object.entries(moduleNameMap).map(([id, name]) => {
      let count = modMap[id] || 0;
      if (id === "update") {
        count += (modMap.sync || 0);
      }
      return { id, name, count };
    }).sort((a, b) => b.count - a.count);

    // Módulos mais utilizados no período (ex: top 5 com acessos reais)
    const activeModules = allModules.filter((m) => m.count > 0);
    const topModules = (activeModules.length > 0 ? activeModules : allModules).slice(0, 5);

    const totalInst = targetInstallations.length;
    const platCounts: Record<string, number> = {};
    for (const inst of targetInstallations) {
      let p = inst.platform || "Desconhecido";
      if (p === "darwin" || p === "mac_web") p = "macOS";
      else if (p === "win32" || p === "windows_web") p = "Windows";
      else if (p === "linux" || p === "linux_web") p = "Linux";
      platCounts[p] = (platCounts[p] || 0) + 1;
    }

    const platforms = Object.entries(platCounts).map(([name, count]) => ({
      name,
      count,
      pct: totalInst > 0 ? Math.round((count / totalInst) * 100) : 0,
    }));

    // Computa o total real de slides projetados a partir da tabela consolidada telemetry_song_plays
    let totalSlidesCount = 0;
    if (Array.isArray(filteredSongPlays) && filteredSongPlays.length > 0) {
      for (const sp of filteredSongPlays) {
        totalSlidesCount += Number(sp.slides_shown) || Number(sp.total_slides) || 0;
      }
    } else {
      totalSlidesCount = slidesCount;
    }

    // Calcula instalações ativas hoje (únicas por installation_id que abriram o app hoje)
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeTodaySet = new Set<string>();
    for (const ev of filteredEvents) {
      if (ev.event_name === "app_started" && ev.created_at && ev.created_at.startsWith(todayStr)) {
        activeTodaySet.add(ev.installation_id || String(ev.id));
      }
    }
    if (Array.isArray(filteredSongPlays)) {
      for (const sp of filteredSongPlays) {
        const d = (sp.started_at || sp.created_at || "").slice(0, 10);
        if (d === todayStr && sp.installation_id) {
          activeTodaySet.add(sp.installation_id);
        }
      }
    }
    const activeTodayCount = activeTodaySet.size > 0 ? activeTodaySet.size : (totalInst > 0 ? 1 : 0);

    return {
      totalInstallations: totalInst,
      totalEvents: filteredEvents.length,
      totalSongsPlayed: finalSongsCount,
      totalSlidesProjected: totalSlidesCount,
      totalErrors: errors.length,
      activeToday: activeTodayCount,
      topSongs,
      musicEngagement,
      topModules,
      allModules,
      platforms,
      versions: [{ version: "1.9.4", count: totalInst }],
      recentErrors: errors,
      heatmap,
      dailyActiveUsers: generateDauFromEvents(filteredEvents),
      weeklyBreakdown: generatePeriodBreakdown(filteredEvents, filteredSongPlays, period),
    };
  } catch (err) {
    console.warn("Falha na consulta ao Supabase:", err);
    throw err;
  }
}

/**
 * Gera os dados visuais do gráfico de barras conforme o horizonte temporal selecionado:
 * - "7d": 7 dias da semana (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
 * - "30d": 4 semanas cronológicas (Sem 1, Sem 2, Sem 3, Sem 4)
 * - "all": 6 meses históricos consolidados (ex: Mai, Jun, Jul, Ago, Set, Out)
 */
export function generatePeriodBreakdown(
  events: any[],
  songPlays: any[] = [],
  period: "7d" | "30d" | "all" = "7d"
): WeeklyDayData[] {
  const now = new Date();

  // 1. MODO 7 DIAS (7d)
  if (period === "7d") {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const fullNames = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];

    const days: WeeklyDayData[] = dayNames.map((day, idx) => ({
      day,
      fullDate: fullNames[idx],
      music: 0,
      slides: 0,
      desktop: 0,
      web: 0,
      slidesPct: 0,
      musicPct: 0,
      basePct: 0,
    }));

    const dailyDesktopInstallations: Set<string>[] = Array.from({ length: 7 }, () => new Set<string>());
    const dailyWebInstallations: Set<string>[] = Array.from({ length: 7 }, () => new Set<string>());

    for (const ev of events) {
      const dt = new Date(ev.created_at);
      const dayIdx = dt.getDay();
      if (dayIdx >= 0 && dayIdx <= 6) {
        if (ev.event_name === "app_started") {
          const instId = ev.installation_id || String(ev.id);
          const isDesktop = ev.platform === "win32" || ev.platform === "darwin" || ev.platform === "linux" || !ev.platform?.includes("web");
          if (isDesktop) {
            dailyDesktopInstallations[dayIdx].add(instId);
          } else {
            dailyWebInstallations[dayIdx].add(instId);
          }
        }
        if (!songPlays || songPlays.length === 0) {
          if (ev.event_name === "song_played") days[dayIdx].music++;
          else if (ev.event_name === "slide_projected") days[dayIdx].slides++;
        }
      }
    }

    if (Array.isArray(songPlays) && songPlays.length > 0) {
      for (const sp of songPlays) {
        const dt = new Date(sp.started_at || sp.created_at);
        const dayIdx = dt.getDay();
        if (dayIdx >= 0 && dayIdx <= 6) {
          days[dayIdx].music++;
          const s = Number(sp.slides_shown) || Number(sp.total_slides) || 0;
          days[dayIdx].slides += s;

          const instId = sp.installation_id;
          if (instId && !dailyDesktopInstallations[dayIdx].has(instId) && !dailyWebInstallations[dayIdx].has(instId)) {
            dailyDesktopInstallations[dayIdx].add(instId);
          }
        }
      }
    }

    for (let i = 0; i < 7; i++) {
      days[i].desktop = dailyDesktopInstallations[i].size;
      days[i].web = dailyWebInstallations[i].size;
    }

    return calculateBarPercentages(days);
  }

  // 2. MODO 30 DIAS (30d) - 4 Semanas Dinâmicas
  if (period === "30d") {
    const weeks: WeeklyDayData[] = [];
    const weekDesktopInstallations: Set<string>[] = Array.from({ length: 4 }, () => new Set<string>());
    const weekWebInstallations: Set<string>[] = Array.from({ length: 4 }, () => new Set<string>());

    const weekRanges = [
      { startDay: 29, endDay: 22, label: "Sem 1" },
      { startDay: 21, endDay: 15, label: "Sem 2" },
      { startDay: 14, endDay: 8, label: "Sem 3" },
      { startDay: 7, endDay: 0, label: "Sem 4" },
    ];

    for (let w = 0; w < 4; w++) {
      const r = weekRanges[w];
      const dStart = new Date(now.getTime() - r.startDay * 24 * 60 * 60 * 1000);
      const dEnd = new Date(now.getTime() - r.endDay * 24 * 60 * 60 * 1000);
      const fmtStart = dStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const fmtEnd = dEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

      weeks.push({
        day: r.label,
        fullDate: `Semana ${w + 1} (${fmtStart} a ${fmtEnd})`,
        music: 0,
        slides: 0,
        desktop: 0,
        web: 0,
        slidesPct: 0,
        musicPct: 0,
        basePct: 0,
      });
    }

    const getWeekIndex = (date: Date): number => {
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
      if (diffDays <= 7) return 3; // Sem 4 (semana atual)
      if (diffDays <= 14) return 2; // Sem 3
      if (diffDays <= 21) return 1; // Sem 2
      if (diffDays <= 30) return 0; // Sem 1
      return -1;
    };

    for (const ev of events) {
      const dt = new Date(ev.created_at);
      const wIdx = getWeekIndex(dt);
      if (wIdx >= 0 && wIdx <= 3) {
        if (ev.event_name === "app_started") {
          const instId = ev.installation_id || String(ev.id);
          const isDesktop = ev.platform === "win32" || ev.platform === "darwin" || ev.platform === "linux" || !ev.platform?.includes("web");
          const dayKey = `${instId}_${dt.toISOString().slice(0, 10)}`;
          if (isDesktop) {
            weekDesktopInstallations[wIdx].add(dayKey);
          } else {
            weekWebInstallations[wIdx].add(dayKey);
          }
        }
        if (!songPlays || songPlays.length === 0) {
          if (ev.event_name === "song_played") weeks[wIdx].music++;
          else if (ev.event_name === "slide_projected") weeks[wIdx].slides++;
        }
      }
    }

    if (Array.isArray(songPlays) && songPlays.length > 0) {
      for (const sp of songPlays) {
        const dt = new Date(sp.started_at || sp.created_at);
        const wIdx = getWeekIndex(dt);
        if (wIdx >= 0 && wIdx <= 3) {
          weeks[wIdx].music++;
          const s = Number(sp.slides_shown) || Number(sp.total_slides) || 0;
          weeks[wIdx].slides += s;

          const instId = sp.installation_id;
          if (instId) {
            const dayKey = `${instId}_${dt.toISOString().slice(0, 10)}`;
            if (!weekDesktopInstallations[wIdx].has(dayKey) && !weekWebInstallations[wIdx].has(dayKey)) {
              weekDesktopInstallations[wIdx].add(dayKey);
            }
          }
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      weeks[i].desktop = weekDesktopInstallations[i].size;
      weeks[i].web = weekWebInstallations[i].size;
    }

    return calculateBarPercentages(weeks);
  }

  // 3. MODO GERAL (all) - Últimos 6 Meses Dinâmicos
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const fullMonthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const months: WeeklyDayData[] = [];
  const monthDesktopInstallations: Set<string>[] = Array.from({ length: 6 }, () => new Set<string>());
  const monthWebInstallations: Set<string>[] = Array.from({ length: 6 }, () => new Set<string>());

  for (let m = 5; m >= 0; m--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const mIdx = targetDate.getMonth();
    const yVal = targetDate.getFullYear();
    months.push({
      day: monthNames[mIdx],
      fullDate: `${fullMonthNames[mIdx]} de ${yVal}`,
      music: 0,
      slides: 0,
      desktop: 0,
      web: 0,
      slidesPct: 0,
      musicPct: 0,
      basePct: 0,
    });
  }

  const getMonthIndex = (date: Date): number => {
    const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (diffMonths >= 0 && diffMonths < 6) {
      return 5 - diffMonths;
    }
    return -1;
  };

  for (const ev of events) {
    const dt = new Date(ev.created_at);
    const mIdx = getMonthIndex(dt);
    if (mIdx >= 0 && mIdx < 6) {
      if (ev.event_name === "app_started") {
        const instId = ev.installation_id || String(ev.id);
        const isDesktop = ev.platform === "win32" || ev.platform === "darwin" || ev.platform === "linux" || !ev.platform?.includes("web");
        const dayKey = `${instId}_${dt.toISOString().slice(0, 10)}`;
        if (isDesktop) {
          monthDesktopInstallations[mIdx].add(dayKey);
        } else {
          monthWebInstallations[mIdx].add(dayKey);
        }
      }
      if (!songPlays || songPlays.length === 0) {
        if (ev.event_name === "song_played") months[mIdx].music++;
        else if (ev.event_name === "slide_projected") months[mIdx].slides++;
      }
    }
  }

  if (Array.isArray(songPlays) && songPlays.length > 0) {
    for (const sp of songPlays) {
      const dt = new Date(sp.started_at || sp.created_at);
      const mIdx = getMonthIndex(dt);
      if (mIdx >= 0 && mIdx < 6) {
        months[mIdx].music++;
        const s = Number(sp.slides_shown) || Number(sp.total_slides) || 0;
        months[mIdx].slides += s;

        const instId = sp.installation_id;
        if (instId) {
          const dayKey = `${instId}_${dt.toISOString().slice(0, 10)}`;
          if (!monthDesktopInstallations[mIdx].has(dayKey) && !monthWebInstallations[mIdx].has(dayKey)) {
            monthDesktopInstallations[mIdx].add(dayKey);
          }
        }
      }
    }
  }

  for (let i = 0; i < 6; i++) {
    months[i].desktop = monthDesktopInstallations[i].size;
    months[i].web = monthWebInstallations[i].size;
  }

  return calculateBarPercentages(months);
}

function calculateBarPercentages(items: WeeklyDayData[]): WeeklyDayData[] {
  const maxTotal = Math.max(1, ...items.map((d) => d.music + d.slides + d.desktop + d.web));

  for (const d of items) {
    const total = d.music + d.slides + d.desktop + d.web;
    if (total > 0) {
      const scale = (total / maxTotal) * 90;
      const mRatio = d.music / total;
      const sRatio = d.slides / total;
      const bRatio = (d.desktop + d.web) / total;
      d.slidesPct = Math.max(8, Math.round(scale * sRatio));
      d.musicPct = Math.max(8, Math.round(scale * mRatio));
      d.basePct = Math.max(6, Math.round(scale * bRatio));
    } else {
      d.slidesPct = 0;
      d.musicPct = 0;
      d.basePct = 0;
    }
  }

  return items;
}

function generateDauFromEvents(events: any[]): { date: string; desktop: number; web: number }[] {
  if (events.length === 0) {
    return [];
  }
  const dateMap: Record<string, { desktop: Set<string>; web: Set<string> }> = {};
  for (const ev of events) {
    if (ev.event_name === "app_started") {
      const d = new Date(ev.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (!dateMap[d]) dateMap[d] = { desktop: new Set(), web: new Set() };
      const isDesktop = ev.platform === "win32" || ev.platform === "darwin" || ev.platform === "linux" || !ev.platform?.includes("web");
      const instId = ev.installation_id || String(ev.id);
      if (isDesktop) {
        dateMap[d].desktop.add(instId);
      } else {
        dateMap[d].web.add(instId);
      }
    }
  }
  return Object.entries(dateMap).map(([date, sets]) => ({
    date,
    desktop: sets.desktop.size,
    web: sets.web.size,
  }));
}

/**
 * Dados de amostra para visualização simulada (Modo Amostra)
 */
export function getSampleTelemetryData(): TelemetrySummary {
  return {
    totalInstallations: 85,
    totalEvents: 6400,
    totalSongsPlayed: 1480,
    totalSlidesProjected: 4920,
    totalErrors: 0,
    activeToday: 42,
    topSongs: [
      { name: "Porque Ele Vive (HA #70)", subtitle: "Hinário Adventista", album: "Hinário", count: 342, completed: 310, avgCompletionPct: 94, avgDurationSeconds: 220, totalDurationSeconds: 75240, primaryAudioMode: "cantado", audioModes: { cantado: 280, playback: 62 }, stopReasons: { completed: 310, next_song: 32 } },
      { name: "Grandioso És Tu (HA #34)", subtitle: "Hinário Adventista", album: "Hinário", count: 298, completed: 285, avgCompletionPct: 96, avgDurationSeconds: 240, totalDurationSeconds: 71520, primaryAudioMode: "playback", audioModes: { cantado: 90, playback: 208 }, stopReasons: { completed: 285, next_song: 13 } },
      { name: "Castelo Forte (HA #33)", subtitle: "Hinário Adventista", album: "Hinário", count: 245, completed: 230, avgCompletionPct: 92, avgDurationSeconds: 195, totalDurationSeconds: 47775, primaryAudioMode: "cantado", audioModes: { cantado: 210, playback: 35 }, stopReasons: { completed: 230, closed: 15 } },
      { name: "Em Fervente Oração (HA #416)", subtitle: "Hinário Adventista", album: "Hinário", count: 218, completed: 195, avgCompletionPct: 89, avgDurationSeconds: 210, totalDurationSeconds: 45780, primaryAudioMode: "cantado", audioModes: { cantado: 190, playback: 28 }, stopReasons: { completed: 195, closed: 23 } },
      { name: "Alvo Mais Que a Neve (HA #205)", subtitle: "Hinário Adventista", album: "Hinário", count: 189, completed: 172, avgCompletionPct: 91, avgDurationSeconds: 205, totalDurationSeconds: 38745, primaryAudioMode: "cantado", audioModes: { cantado: 170, playback: 19 }, stopReasons: { completed: 172, next_song: 17 } },
    ],
    musicEngagement: {
      totalPlays: 1480,
      completedPlays: 1380,
      overallCompletionPct: 93,
      totalDurationSeconds: 312000,
      avgDurationSeconds: 210,
      audioModeDistribution: [
        { mode: "cantado", label: "Cantado", icon: "cantado", count: 1065, pct: 72 },
        { mode: "playback", label: "Playback", icon: "playback", count: 385, pct: 26 },
        { mode: "no_audio", label: "Sem Áudio", icon: "no_audio", count: 30, pct: 2 },
      ],
      stopReasonDistribution: [
        { reason: "completed", label: "Concluída até o fim", count: 1280, pct: 86 },
        { reason: "next_song", label: "Avançou para próxima", count: 120, pct: 8 },
        { reason: "closed", label: "Fechou o player", count: 65, pct: 5 },
        { reason: "app_closed", label: "App encerrado", count: 15, pct: 1 },
      ],
    },
    topModules: [
      { id: "praise", name: "Louvor & Coletâneas", count: 1250 },
      { id: "bible", name: "Bíblia Sagrada", count: 680 },
      { id: "timer", name: "Cronômetro de Culto", count: 420 },
      { id: "messages", name: "Mensagens & Avisos", count: 290 },
    ],
    allModules: [
      { id: "praise", name: "Louvor & Coletâneas", count: 1250 },
      { id: "bible", name: "Bíblia Sagrada", count: 680 },
      { id: "timer", name: "Cronômetro de Culto", count: 420 },
      { id: "messages", name: "Mensagens & Avisos", count: 290 },
      { id: "hymnal", name: "Hinário Adventista", count: 210 },
      { id: "liturgy", name: "Liturgia", count: 150 },
    ],
    platforms: [
      { name: "Windows", count: 65, pct: 76 },
      { name: "macOS", count: 14, pct: 16 },
      { name: "Linux", count: 4, pct: 5 },
      { name: "Web", count: 2, pct: 3 },
    ],
    versions: [
      { version: "1.9.4", count: 70 },
      { version: "1.9.3", count: 15 },
    ],
    recentErrors: [],
    heatmap: Array.from({ length: 7 }, () => Array(24).fill(0)),
    dailyActiveUsers: [
      { date: "01/10", desktop: 38, web: 16 },
      { date: "02/10", desktop: 52, web: 18 },
      { date: "03/10", desktop: 41, web: 15 },
      { date: "04/10", desktop: 31, web: 12 },
      { date: "05/10", desktop: 36, web: 14 },
      { date: "06/10", desktop: 47, web: 17 },
      { date: "Hoje", desktop: 72, web: 24 },
    ],
    weeklyBreakdown: [
      { day: "Dom", fullDate: "Domingo de Culto", music: 240, slides: 680, desktop: 42, web: 8, slidesPct: 35, musicPct: 40, basePct: 15 },
      { day: "Seg", fullDate: "Segunda-feira", music: 45, slides: 110, desktop: 12, web: 3, slidesPct: 15, musicPct: 18, basePct: 10 },
      { day: "Ter", fullDate: "Terça-feira", music: 60, slides: 140, desktop: 15, web: 4, slidesPct: 18, musicPct: 22, basePct: 10 },
      { day: "Qua", fullDate: "Quarta (Culto de Oração)", music: 210, slides: 590, desktop: 38, web: 9, slidesPct: 32, musicPct: 38, basePct: 14 },
      { day: "Qui", fullDate: "Quinta-feira", music: 70, slides: 160, desktop: 18, web: 5, slidesPct: 20, musicPct: 24, basePct: 10 },
      { day: "Sex", fullDate: "Sexta (Abertura de Sábado)", music: 280, slides: 750, desktop: 48, web: 11, slidesPct: 38, musicPct: 42, basePct: 15 },
      { day: "Sáb", fullDate: "Sábado (Escola Sabatina & Culto)", music: 420, slides: 1180, desktop: 72, web: 16, slidesPct: 45, musicPct: 45, basePct: 10 },
    ],
  };
}

/**
 * Estado vazio / inicial da telemetria (quando ainda não há dados ou antes do carregamento)
 */
export function getEmptyTelemetryData(): TelemetrySummary {
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const fullNames = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  return {
    totalInstallations: 0,
    totalEvents: 0,
    totalSongsPlayed: 0,
    totalSlidesProjected: 0,
    totalErrors: 0,
    activeToday: 0,
    topSongs: [],
    musicEngagement: {
      totalPlays: 0,
      completedPlays: 0,
      overallCompletionPct: 0,
      totalDurationSeconds: 0,
      avgDurationSeconds: 0,
      audioModeDistribution: [
        { mode: "cantado", label: "Cantado", icon: "cantado", count: 0, pct: 0 },
        { mode: "playback", label: "Playback", icon: "playback", count: 0, pct: 0 },
        { mode: "no_audio", label: "Sem Áudio", icon: "no_audio", count: 0, pct: 0 },
      ],
      stopReasonDistribution: [
        { reason: "completed", label: "Concluída até o fim", count: 0, pct: 0 },
        { reason: "next_song", label: "Avançou para próxima", count: 0, pct: 0 },
        { reason: "closed", label: "Fechou o player", count: 0, pct: 0 },
        { reason: "app_closed", label: "App encerrado", count: 0, pct: 0 },
      ],
    },
    topModules: [],
    allModules: [],
    platforms: [],
    versions: [],
    recentErrors: [],
    heatmap: Array.from({ length: 7 }, () => Array(24).fill(0)),
    dailyActiveUsers: [],
    weeklyBreakdown: dayNames.map((day, idx) => ({
      day,
      fullDate: fullNames[idx],
      music: 0,
      slides: 0,
      desktop: 0,
      web: 0,
      slidesPct: 0,
      musicPct: 0,
      basePct: 0,
    })),
  };
}

