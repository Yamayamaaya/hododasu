import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createSession } from '../lib/api';
import { CreateSessionRequest } from '@hododasu/shared';

export const Route = createFileRoute('/new')({
  component: NewSessionPage,
});

function NewSessionPage() {
  const [formData, setFormData] = useState<CreateSessionRequest>({
    title: '',
    totalAmount: 0,
    participants: [{ name: '', weight: 1 }],
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
      participants: [...formData.participants, { name: '', weight: 1 }],
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">新規セッション作成</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タイトル（任意）</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">合計金額（円）*</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={formData.totalAmount}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">参加者 *</label>
            <div className="space-y-3">
              {formData.participants.map((p, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="名前"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    value={p.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="重み"
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                    value={p.weight}
                    onChange={(e) =>
                      updateParticipant(index, 'weight', parseInt(e.target.value) || 1)
                    }
                    required
                  />
                  {formData.participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                + 参加者を追加
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知メッセージ（任意）
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="置換変数: {name} {amount} {title} {total}"
              value={formData.messageTemplate}
              onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.attachDetailsLink}
                onChange={(e) => setFormData({ ...formData, attachDetailsLink: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">計算方法の説明リンクを添付</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? '作成中...' : '作成'}
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              キャンセル
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
