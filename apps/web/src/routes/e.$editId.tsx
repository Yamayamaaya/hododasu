import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, updateSession, deleteSession } from '../lib/api';
import { buildLineMessage, generateLineUrl } from '../lib/line';
import { addViewHistory } from '../lib/history';
import { SessionInput, UpdateSessionRequest } from '@hododasu/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Trash2, Send, AlertCircle, Home } from 'lucide-react';

export const Route = createFileRoute('/e/$editId')({
  component: EditSessionPage,
});

function formatRoundingDigit(roundingDigit: number): string {
  if (roundingDigit === 0.1) return '0.1の位（1円単位）';
  if (roundingDigit === 1) return '1の位（10円単位）';
  if (roundingDigit === 10) return '10の位（100円単位）';
  if (roundingDigit === 100) return '100の位（1000円単位）';
  return `${roundingDigit}の位`;
}

type RoundingUnit = SessionInput['roundingUnit'];

function normalizeRoundingUnit(value: unknown): RoundingUnit {
  if (value === 0.1 || value === 1 || value === 10 || value === 100) return value;
  return 0.1;
}

function roundingUnitFromSelect(value: string): RoundingUnit {
  switch (value) {
    case '0.1':
      return 0.1;
    case '1':
      return 1;
    case '10':
      return 10;
    case '100':
      return 100;
    default:
      return 0.1;
  }
}

function EditSessionPage() {
  const { editId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', editId],
    queryFn: () => getSession(editId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSessionRequest) => updateSession(editId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', editId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSession(editId),
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  const [formData, setFormData] = useState<SessionInput | null>(null);

  // セッション情報が取得できたら履歴に追加
  useEffect(() => {
    if (session) {
      addViewHistory({
        type: 'edit',
        id: editId,
        title: session.title || '無題のセッション',
        timestamp: Date.now(),
        path: `/e/${editId}`,
      });
    }
  }, [session, editId]);

  if (isLoading) {
    return (
      <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>セッションが見つかりません</span>
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  トップに戻る
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const currentData: SessionInput = formData || {
    title: session.title,
    totalAmount: session.totalAmount,
    participants: session.participants
      .filter((p) => p.name !== '幹事') // 幹事は除外
      .map((p) => ({
        name: p.name,
        weight: p.weight,
      })),
    messageTemplate: session.messageTemplate || '',
    attachDetailsLink: session.attachDetailsLink,
    roundingMethod: session.roundingMethod || 'round_half_up',
    roundingUnit: normalizeRoundingUnit(session.roundingUnit),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (currentData.participants.length === 0) {
      alert('参加者を1人以上追加してください');
      return;
    }
    if (currentData.participants.some((p) => !p.name.trim())) {
      alert('参加者の名前を入力してください');
      return;
    }
    updateMutation.mutate(currentData as UpdateSessionRequest);
    setFormData(null);
  };

  const addParticipant = () => {
    setFormData({
      ...currentData,
      participants: [...currentData.participants, { name: '', weight: 100 }],
    });
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...currentData,
      participants: currentData.participants.filter((_, i) => i !== index),
    });
  };

  const updateParticipant = (index: number, field: 'name' | 'weight', value: string | number) => {
    const updated = [...currentData.participants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...currentData, participants: updated });
  };

  const baseUrl = window.location.origin;

  return (
    <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            トップに戻る
          </Button>
        </Link>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-4xl">{session.title}</CardTitle>
            <CardDescription className="text-sm sm:text-base">セッションの編集と計算結果の確認</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base">
                  タイトル <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={currentData.title}
                  onChange={(e) => setFormData({ ...currentData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="totalAmount" className="text-sm sm:text-base">
                  合計金額（円）<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  value={currentData.totalAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...currentData,
                      totalAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base">
                  参加者 <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2 sm:space-y-3">
                  {currentData.participants.map((p, index) => (
                    <div key={index} className="bg-muted/30 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <div className="flex-1">
                            <Label htmlFor={`name-${index}`} className="text-xs text-muted-foreground">
                              名前
                            </Label>
                            <Input
                              id={`name-${index}`}
                              type="text"
                              placeholder="名前"
                              value={p.name}
                              onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="w-full sm:w-24">
                            <Label
                              htmlFor={`weight-${index}`}
                              className="text-xs text-muted-foreground"
                            >
                              傾斜
                            </Label>
                            <Input
                              id={`weight-${index}`}
                              type="number"
                              min="1"
                              placeholder="100"
                              value={p.weight}
                              onChange={(e) =>
                                updateParticipant(index, 'weight', parseInt(e.target.value) || 100)
                              }
                              required
                            />
                          </div>
                          {currentData.participants.length > 1 && (
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeParticipant(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addParticipant} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    参加者を追加
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="messageTemplate" className="text-sm sm:text-base">通知メッセージ（任意）</Label>
                <Textarea
                  id="messageTemplate"
                  rows={3}
                  placeholder="置換変数: {name} {amount} {title} {total}"
                  value={currentData.messageTemplate}
                  onChange={(e) => setFormData({ ...currentData, messageTemplate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  使用可能な変数: {'{name}'}, {'{amount}'}, {'{title}'}, {'{total}'}
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="roundingMethod" className="text-sm sm:text-base">
                    端数処理方法 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={currentData.roundingMethod || 'round_half_up'}
                    onValueChange={(value) =>
                      setFormData({
                        ...currentData,
                        roundingMethod: value as 'round_up' | 'round_down' | 'round_half_up',
                      })
                    }
                    required
                  >
                    <SelectTrigger id="roundingMethod">
                      <SelectValue placeholder="端数処理方法を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_up">切り上げ</SelectItem>
                      <SelectItem value="round_down">切り下げ</SelectItem>
                      <SelectItem value="round_half_up">四捨五入</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="roundingUnit" className="text-sm sm:text-base">
                    端数処理の位 <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={currentData.roundingUnit?.toString() || '0.1'}
                    onValueChange={(value) =>
                      setFormData({
                        ...currentData,
                        roundingUnit: roundingUnitFromSelect(value),
                      })
                    }
                    required
                  >
                    <SelectTrigger id="roundingUnit">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.1">0.1の位（1円単位）</SelectItem>
                      <SelectItem value="1">1の位（10円単位）</SelectItem>
                      <SelectItem value="10">10の位（100円単位）</SelectItem>
                      <SelectItem value="100">100の位（1000円単位）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachDetailsLink"
                  checked={currentData.attachDetailsLink}
                  onCheckedChange={(checked) =>
                    setFormData({ ...currentData, attachDetailsLink: checked === true })
                  }
                />
                <Label htmlFor="attachDetailsLink" className="text-xs sm:text-sm font-normal cursor-pointer">
                  計算方法の説明リンクを添付
                </Label>
              </div>

              <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                {updateMutation.isPending ? '更新中...' : '更新'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 計算結果表示 */}
        {session.participants.some((p) => p.shareAmount !== null) && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">計算結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {session.participants.map((p) => {
                if (p.shareAmount === null) return null;
                const isOrganizer = p.name === '幹事';
                const message = buildLineMessage(
                  session.messageTemplate,
                  p.name,
                  p.shareAmount,
                  session.title,
                  session.totalAmount,
                  session.attachDetailsLink,
                  baseUrl,
                  session.resultId
                );
                const lineUrl = generateLineUrl(message);

                return (
                  <div key={p.id} className="bg-muted/30 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base sm:text-lg">{p.name}</span>
                        {!isOrganizer && (
                          <Badge variant="secondary" className="text-xs">傾斜: {p.weight}</Badge>
                        )}
                        {isOrganizer && (
                          <Badge variant="outline" className="text-xs">
                            幹事分
                          </Badge>
                        )}
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-primary">
                        {p.shareAmount.toLocaleString()}円
                      </div>
                    </div>
                    {isOrganizer && session.roundingMethod && session.roundingUnit && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                        {session.roundingMethod === 'round_up'
                          ? `※ 切り上げにより発生した差額を受け取ります（${formatRoundingDigit(session.roundingUnit)}）`
                          : session.roundingMethod === 'round_down'
                          ? `※ 切り下げにより発生した差額を負担します（${formatRoundingDigit(session.roundingUnit)}）`
                          : `※ 四捨五入により発生した差額を処理します（${formatRoundingDigit(session.roundingUnit)}）`}
                      </div>
                    )}
                    {!isOrganizer && (
                      <>
                        <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
                        </div>
                        <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="default" className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700">
                            <Send className="h-4 w-4" />
                            LINEで送る
                          </Button>
                        </a>
                      </>
                    )}
                  </div>
                );
              })}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                  <span>合計</span>
                  <span className="text-primary text-lg sm:text-xl">
                    {session.participants
                      .reduce((sum, p) => sum + (p.shareAmount || 0), 0)
                      .toLocaleString()}
                    円
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-0">
          <CardContent className="pt-4 sm:pt-6">
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('本当に削除しますか？')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              {deleteMutation.isPending ? '削除中...' : 'セッションを削除'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
