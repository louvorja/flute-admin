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

export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data.error_description || data.msg || data.message || "E-mail ou senha incorretos";
      return { success: false, error: msg };
    }

    if (data.access_token) {
      const name = data.user?.user_metadata?.name || data.user?.raw_user_meta_data?.name || "";
      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: {
          id: data.user?.id || "",
          email: data.user?.email || email,
          name,
          role: data.user?.role,
          created_at: data.user?.created_at,
          last_sign_in_at: data.user?.last_sign_in_at,
        },
      };
      localStorage.setItem(STORAGE_AUTH_SESSION, JSON.stringify(session));
      return { success: true };
    }

    return { success: false, error: "Resposta inválida do servidor de autenticação" };
  } catch (err: any) {
    return { success: false, error: err.message || "Falha de rede ao conectar ao Supabase" };
  }
}

/**
 * Busca o perfil atualizado do usuário autenticado diretamente da API do Supabase Auth
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
    const name = data.user_metadata?.name || data.raw_user_meta_data?.name || "";
    const updatedProfile: UserProfile = {
      id: data.id,
      email: data.email,
      name,
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
 * Atualiza os dados cadastrais (nome, email, senha) do usuário autenticado
 */
export async function updateUserProfile(payload: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string; error?: string }> {
  try {
    const token = getAuthToken();
    if (!token) return { success: false, error: "Usuário não autenticado." };

    const body: Record<string, any> = {};
    if (payload.name !== undefined) {
      body.data = { name: payload.name.trim() };
    }
    if (payload.email) {
      body.email = payload.email.trim();
    }
    if (payload.password) {
      body.password = payload.password;
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const msg = data.error_description || data.msg || data.message || "Falha ao atualizar perfil";
      return { success: false, error: msg };
    }

    // Atualiza a sessão salva localmente
    const session = getStoredSession();
    if (session) {
      const updatedProfile: UserProfile = {
        ...session.user,
        email: data.email || session.user.email,
        name: data.user_metadata?.name ?? payload.name ?? session.user.name,
      };
      session.user = updatedProfile;
      localStorage.setItem(STORAGE_AUTH_SESSION, JSON.stringify(session));
      return {
        success: true,
        user: updatedProfile,
        message: data.new_email
          ? `Perfil atualizado! Um e-mail de confirmação foi enviado para ${data.new_email}.`
          : "Dados de usuário atualizados com sucesso!",
      };
    }

    return { success: true, message: "Dados atualizados com sucesso!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao conectar com o serviço de autenticação." };
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
    // Se for 401 Unauthorized e tínhamos sessão, limpa a sessão expirada
    if (res.status === 401 && token) {
      signOut();
    }
    throw new Error(`Supabase query failed: ${res.statusText} (${res.status})`);
  }

  // Se o servidor retornar 204 No Content ou corpo vazio (comum em PATCH/DELETE com return=minimal)
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
 * Busca todas as notificações cadastradas
 */
export async function getAppNotifications(): Promise<AppNotification[]> {
  try {
    return await fetchFromSupabase("app_notifications?select=*&order=created_at.desc&limit=150");
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
 * Exclui uma notificação do banco
 */
export async function deleteAppNotification(id: number): Promise<boolean> {
  try {
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

