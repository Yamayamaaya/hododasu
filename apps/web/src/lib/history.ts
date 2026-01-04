export type HistoryType = 'edit' | 'result';

export interface ViewHistory {
  type: HistoryType;
  id: string;
  title: string;
  timestamp: number;
  path: string;
}

const STORAGE_KEY = 'hododasu_view_history';
const MAX_HISTORY_ITEMS = 50; // パフォーマンスのために上限を設定

/**
 * localStorageから履歴を取得
 */
export function getViewHistory(): ViewHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ViewHistory[];
  } catch (error) {
    console.error('Failed to get view history:', error);
    return [];
  }
}

/**
 * 履歴をlocalStorageに保存
 */
function saveViewHistory(history: ViewHistory[]): void {
  try {
    // 最大件数を超える場合は古いものを削除
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save view history:', error);
  }
}

/**
 * 履歴に追加（既に同じページがあれば更新して最新に移動）
 */
export function addViewHistory(history: ViewHistory): void {
  const currentHistory = getViewHistory();
  
  // 同じページ（type + id）の既存履歴を削除
  const filteredHistory = currentHistory.filter(
    (h) => !(h.type === history.type && h.id === history.id)
  );
  
  // 新しい履歴を先頭に追加
  const newHistory = [history, ...filteredHistory];
  
  saveViewHistory(newHistory);
}

/**
 * 履歴を削除
 */
export function removeViewHistory(type: HistoryType, id: string): void {
  const currentHistory = getViewHistory();
  const filteredHistory = currentHistory.filter(
    (h) => !(h.type === type && h.id === id)
  );
  saveViewHistory(filteredHistory);
}

/**
 * すべての履歴をクリア
 */
export function clearViewHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear view history:', error);
  }
}



