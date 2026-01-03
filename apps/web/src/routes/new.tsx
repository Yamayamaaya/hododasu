import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createSession } from '../lib/api';
import { CreateSessionRequest } from '@hododasu/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/new')({
  component: NewSessionPage,
});

function NewSessionPage() {
  const [formData, setFormData] = useState<CreateSessionRequest>({
    title: '',
    totalAmount: 0,
    participants: [{ name: '', weight: 100 }],
    messageTemplate: '',
    attachDetailsLink: false,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      window.location.href = `/e/${data.editId}`;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.participants.length === 0) {
      alert('参加者を1人以上追加してください');
      return;
    }
    if (formData.participants.some((p) => !p.name.trim())) {
      alert('参加者の名前を入力してください');
      return;
    }
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
    <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-4xl">新規セッション作成</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              傾斜付き割り勘のセッションを作成します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="title" className="text-sm sm:text-base">
                  タイトル（任意）
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 忘年会"
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
                  value={formData.totalAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })
                  }
                  required
                  placeholder="10000"
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label className="text-sm sm:text-base">
                  参加者 <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2 sm:space-y-3">
                  {formData.participants.map((p, index) => (
                    <div key={index} className="bg-muted/30 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <div className="flex-1">
                          <Label
                            htmlFor={`name-${index}`}
                            className="text-xs text-muted-foreground"
                          >
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
                        {formData.participants.length > 1 && (
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addParticipant}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    参加者を追加
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="messageTemplate" className="text-sm sm:text-base">
                  通知メッセージ（任意）
                </Label>
                <Textarea
                  id="messageTemplate"
                  rows={3}
                  placeholder="置換変数: {name} {amount} {title} {total}"
                  value={formData.messageTemplate}
                  onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  使用可能な変数: {'{name}'}, {'{amount}'}, {'{title}'}, {'{total}'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
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

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                  {createMutation.isPending ? '作成中...' : '作成'}
                </Button>
                <Link to="/">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    キャンセル
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
