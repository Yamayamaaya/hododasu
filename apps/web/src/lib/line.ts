/**
 * LINE送信用の本文を組み立て
 */
export function buildLineMessage(
  messageTemplate: string | null,
  participantName: string,
  shareAmount: number,
  title: string | null,
  totalAmount: number,
  attachDetailsLink: boolean,
  baseUrl: string,
  resultId: string
): string {
  const lines: string[] = [];

  // 通知メッセージ（置換後）
  if (messageTemplate) {
    const replaced = messageTemplate
      .replace(/{name}/g, participantName)
      .replace(/{amount}/g, shareAmount.toLocaleString())
      .replace(/{title}/g, title || '')
      .replace(/{total}/g, totalAmount.toLocaleString());
    lines.push(replaced);
  }

  // 金額行（必須）
  lines.push(`\n${participantName}さんの負担額: ${shareAmount.toLocaleString()}円`);

  // 結果画面のリンク（常に追加）
  const resultUrl = `${baseUrl}/r/${resultId}`;
  lines.push(`\n詳細: ${resultUrl}`);

  // 計算方法の説明リンク（オプション）
  if (attachDetailsLink) {
    const howUrl = `${baseUrl}/how`;
    lines.push(`\n計算方法: ${howUrl}`);
  }

  return lines.join('\n');
}

/**
 * LINE送信URLを生成
 */
export function generateLineUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://line.me/R/msg/text/?${encoded}`;
}

