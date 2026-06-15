import type { AnswerLog, GameResult } from "@/types/game";

const KEYS = {
  last: "virtual_escape_last_result",
  best: "virtual_escape_best_score",
  history: "virtual_escape_history",
  settings: "virtual_escape_settings",
} as const;

export type Settings = {
  soundEnabled: boolean;
  bgmVolume: number;
  reducedMotion: boolean;
  micFallbackTextMode: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  bgmVolume: 0.5,
  reducedMotion: false,
  micFallbackTextMode: false,
};

export type LastResult = {
  sessionId: string;
  playedAt: string;
  mockMode: boolean;
  totalScore: number;
  rank: string;
  success: boolean;
  answers: AnswerLog[];
};

export type HistoryEntry = {
  playedAt: string;
  totalScore: number;
  rank: string;
  success: boolean;
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled storage — ignore */
  }
}

export function saveResult(params: {
  sessionId: string;
  mockMode: boolean;
  result: GameResult;
  answers: AnswerLog[];
}): void {
  const { sessionId, mockMode, result, answers } = params;
  const playedAt = new Date().toISOString();

  const last: LastResult = {
    sessionId,
    playedAt,
    mockMode,
    totalScore: result.totalScore,
    rank: result.rank,
    success: result.success,
    answers,
  };
  write(KEYS.last, last);

  const best = read<number>(KEYS.best, 0);
  if (result.totalScore > best) write(KEYS.best, result.totalScore);

  const history = read<HistoryEntry[]>(KEYS.history, []);
  history.unshift({
    playedAt,
    totalScore: result.totalScore,
    rank: result.rank,
    success: result.success,
  });
  write(KEYS.history, history.slice(0, 20));
}

export function getBestScore(): number {
  return read<number>(KEYS.best, 0);
}

export function getHistory(): HistoryEntry[] {
  return read<HistoryEntry[]>(KEYS.history, []);
}

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) };
}

export function saveSettings(settings: Settings): void {
  write(KEYS.settings, settings);
}
