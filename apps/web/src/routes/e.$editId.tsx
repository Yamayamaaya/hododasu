import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, updateSession, deleteSession } from '../lib/api';
import { buildLineMessage, generateLineUrl } from '../lib/line';
import { addViewHistory } from '../lib/history';
import { SessionInput, UpdateSessionRequest } from '@hododasu/shared';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus, Trash2, Send, AlertCircle, Home, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.success('更新しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSession(editId),
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  const [formData, setFormData] = useState<SessionInput | null>(null);

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
      <div className="px-4 py-6 sm:py-10">
        <div className="max-w-lg sm:max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 py-6 sm:py-10">
        <div className="max-w-lg sm:max-w-3xl mx-auto">
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
      .filter((p) => p.name !== '幹事')
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
      toast.error('タイトルを入力してください');
      return;
    }
    if (currentData.participants.length === 0) {
      toast.error('参加者を1人以上追加してください');
      return;
    }
    if (currentData.participants.some((p) => !p.name.trim())) {
      toast.error('参加者の名前を入力してください');
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
  const hasResults = session.participants.some((p) => p.shareAmount !== null);

  return (
    <div className="px-4 py-6 sm:py-10">
      <div className="max-w-lg sm:max-w-3xl mx-auto space-y-6">
        {/* Session header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{session.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            合計:{' '}
            <span className="font-semibold text-foreground">
              {session.totalAmount.toLocaleString()}円
            </span>
          </p>
        </div>

        {/* 計算結果（メイン表示） */}
        {hasResults && (
          <section>
            <h2 className="text-base font-semibold mb-3">計算結果</h2>
            <div className="space-y-3">
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
                  <div key={p.id} className="bg-card rounded-xl shadow-sm border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{p.name}</span>
                        {!isOrganizer && (
                          <Badge variant="secondary" className="text-xs">
                            傾斜: {p.weight}
                          </Badge>
                        )}
                        {isOrganizer && (
                          <Badge variant="outline" className="text-xs">
                            幹事分
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
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
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button className="w-full h-11 gap-2 bg-[#06C755] hover:bg-[#05a648] text-white">
                            <Send className="h-4 w-4" />
                            LINEで送る
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader className="text-left">
                            <DrawerTitle>{p.name}さんへの送信</DrawerTitle>
                            <DrawerDescription>
                              メッセージを確認して送信してください
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4 pb-2">
                            <div className="bg-muted/50 rounded-lg p-4">
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message}
                              </p>
                            </div>
                          </div>
                          <DrawerFooter>
                            <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                              <Button className="w-full h-12 gap-2 bg-[#06C755] hover:bg-[#05a648] text-white text-base font-bold">
                                <Send className="h-4 w-4" />
                                LINEで送信する
                              </Button>
                            </a>
                            <DrawerClose asChild>
                              <Button variant="outline" className="w-full">
                                キャンセル
                              </Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between items-center border-t pt-3 mt-3 text-base font-bold">
                <span>合計</span>
                <span className="text-primary text-lg">
                  {session.participants
                    .reduce((sum, p) => sum + (p.shareAmount || 0), 0)
                    .toLocaleString()}
                  円
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 編集フォーム（折り畳み） */}
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer py-3">
            <h2 className="text-base font-semibold">内容を編集</h2>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm">
                  タイトル <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  className="h-12"
                  value={currentData.title}
                  onChange={(e) => setFormData({ ...currentData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="totalAmount" className="text-sm">
                  合計金額（円）<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  className="h-12"
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

              <div className="space-y-2">
                <Label className="text-sm">
                  参加者 <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {currentData.participants.map((p, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 border-b border-border/50 pb-2"
                    >
                      <div className="flex-1">
                        <Input
                          id={`name-${index}`}
                          type="text"
                          className="h-12"
                          placeholder="名前"
                          value={p.name}
                          onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          id={`weight-${index}`}
                          type="number"
                          min="1"
                          className="h-12"
                          placeholder="傾斜"
                          value={p.weight}
                          onChange={(e) =>
                            updateParticipant(index, 'weight', parseInt(e.target.value) || 100)
                          }
                          required
                        />
                      </div>
                      {currentData.participants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeParticipant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addParticipant}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    参加者を追加
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="messageTemplate" className="text-sm">
                  通知メッセージ（任意）
                </Label>
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

              <div className="space-y-4 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="roundingMethod" className="text-sm">
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
                    <SelectTrigger id="roundingMethod" className="h-12">
                      <SelectValue placeholder="端数処理方法を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_up">切り上げ</SelectItem>
                      <SelectItem value="round_down">切り下げ</SelectItem>
                      <SelectItem value="round_half_up">四捨五入</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="roundingUnit" className="text-sm">
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
                    <SelectTrigger id="roundingUnit" className="h-12">
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
                <Label
                  htmlFor="attachDetailsLink"
                  className="text-xs sm:text-sm font-normal cursor-pointer"
                >
                  計算方法の説明リンクを添付
                </Label>
              </div>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full h-12 text-base"
              >
                {updateMutation.isPending ? '更新中...' : '更新'}
              </Button>
            </form>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive text-sm w-full mt-4"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '削除中...' : 'セッションを削除'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>セッションを削除しますか？</AlertDialogTitle>
                  <AlertDialogDescription>
                    この操作は取り消せません。割り勘の計算結果と共有リンクがすべて削除されます。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteMutation.mutate()}
                  >
                    削除する
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </details>
      </div>
    </div>
  );
}
