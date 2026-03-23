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

  if (messageTemplate) {
    const replaced = messageTemplate
      .replace(/{name}/g, participantName)
      .replace(/{amount}/g, shareAmount.toLocaleString())
      .replace(/{title}/g, title || '')
      .replace(/{total}/g, totalAmount.toLocaleString());
    lines.push(replaced);
  } else {
    lines.push(`${participantName}さん`);
    if (title) {
      lines.push(`「${title}」の割り勘についてお知らせです。`);
    }
  }

  lines.push(
    `\n負担額: ${shareAmount.toLocaleString()}円（合計 ${totalAmount.toLocaleString()}円）`
  );

  const resultUrl = `${baseUrl}/r/${resultId}`;
  lines.push(`\n詳細はこちら: ${resultUrl}`);

  if (attachDetailsLink) {
    const howUrl = `${baseUrl}/how`;
    lines.push(`\n計算方法: ${howUrl}`);
  }

  return lines.join('\n');
}

export function generateLineUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://line.me/R/msg/text/?${encoded}`;
}
