import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createSession } from '../lib/api';
import { DEFAULT_MESSAGE_TEMPLATE } from '../lib/line';
import { roundingUnitFromSelect } from '../lib/rounding';
import { CreateSessionRequest } from '@hododasu/shared';
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
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { HelpTip } from '@/components/ui/help-tip';
import { WeightChart } from '@/components/WeightChart';

export const Route = createFileRoute('/new')({
  component: NewSessionPage,
});

function NewSessionPage() {
  const [formData, setFormData] = useState<CreateSessionRequest>({
    title: '',
    totalAmount: 0,
    participants: [{ name: '', weight: 100 }],
    messageTemplate: DEFAULT_MESSAGE_TEMPLATE,
    attachDetailsLink: false,
    roundingMethod: 'round_half_up',
    roundingUnit: 0.1,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      window.location.href = `/e/${data.editId}`;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      participants: [...formData.participants, { name: '', weight: 100 }],
    });
  };

  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index),
    });
  };

  const updateParticipant = (index: number, field: 'name' | 'weight', value: string | number) => {
    const updated = [...formData.participants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, participants: updated });
  };

  return (
    <div className="px-5 py-6 sm:py-10">
      <div className="max-w-lg sm:max-w-2xl mx-auto">
        <form id="new-form" onSubmit={handleSubmit} className="space-y-5">
          <section className="bg-card rounded-2xl shadow-sm p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">基本情報</h2>
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">
                タイトル <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                className="h-12"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例: 忘年会"
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
                value={formData.totalAmount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })
                }
                required
                placeholder="10000"
              />
            </div>
          </section>

          <section className="bg-card rounded-2xl shadow-sm p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-muted-foreground">参加者</h2>
              <HelpTip>
                「傾斜」は負担割合です。
                <br />
                全員100なら均等割り。
                <br />
                200にすると他の人の2倍負担になります。
              </HelpTip>
            </div>
            <div className="space-y-2">
              {formData.participants.map((p, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/40 rounded-xl p-2.5">
                  <div className="flex-1">
                    <Input
                      id={`name-${index}`}
                      type="text"
                      className="h-11"
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
                      className="h-11"
                      placeholder="傾斜"
                      value={p.weight || ''}
                      onChange={(e) =>
                        updateParticipant(index, 'weight', parseInt(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  {formData.participants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0 h-11 w-11"
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
                className="w-full h-11"
              >
                <Plus className="h-4 w-4 mr-2" />
                参加者を追加
              </Button>
            </div>
            <WeightChart participants={formData.participants} totalAmount={formData.totalAmount} />
          </section>

          <details className="group bg-card rounded-2xl shadow-sm overflow-hidden">
            <summary className="flex items-center justify-between cursor-pointer px-4 sm:px-5 py-3.5 text-sm font-semibold text-muted-foreground">
              <span>詳細設定</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="messageTemplate" className="text-sm">
                  通知メッセージ（任意）
                </Label>
                <Textarea
                  id="messageTemplate"
                  rows={3}
                  value={formData.messageTemplate}
                  onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  使用可能な変数: {'{name}'}, {'{amount}'}, {'{title}'}, {'{total}'}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="roundingMethod" className="text-sm">
                  端数処理方法
                </Label>
                <Select
                  value={formData.roundingMethod}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
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
                  端数処理の位
                </Label>
                <Select
                  value={formData.roundingUnit.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
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

              <div className="flex items-center space-x-2 min-h-[44px]">
                <Checkbox
                  id="attachDetailsLink"
                  checked={formData.attachDetailsLink}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, attachDetailsLink: checked === true })
                  }
                />
                <Label
                  htmlFor="attachDetailsLink"
                  className="text-xs sm:text-sm font-normal cursor-pointer"
                >
                  計算方法の説明リンクを添付
                </Label>
              </div>
            </div>
          </details>
        </form>

        <div className="h-24" />

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-lg sm:max-w-2xl mx-auto flex items-center gap-3 px-5 py-3">
            <Link to="/" className="shrink-0">
              <Button type="button" variant="outline" className="h-12 px-5">
                戻る
              </Button>
            </Link>
            <Button
              type="submit"
              form="new-form"
              disabled={createMutation.isPending}
              className="flex-1 h-12 text-base font-bold"
            >
              {createMutation.isPending ? '作成中...' : '割り勘を作成'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
