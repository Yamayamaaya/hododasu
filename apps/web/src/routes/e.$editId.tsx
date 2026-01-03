import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, updateSession, deleteSession } from '../lib/api';
import { buildLineMessage, generateLineUrl } from '../lib/line';
import { SessionInput, UpdateSessionRequest } from '@hododasu/shared';

export const Route = createFileRoute('/e/$editId')({
  component: EditSessionPage,
});

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">セッションが見つかりません</p>
          <a href="/" className="text-blue-600 hover:underline">
            トップに戻る
          </a>
        </div>
      </div>
    );
  }

  const currentData: SessionInput = formData || {
    title: session.title,
    totalAmount: session.totalAmount,
    participants: session.participants.map((p) => ({
      name: p.name,
      weight: p.weight,
    })),
    messageTemplate: session.messageTemplate || '',
    attachDetailsLink: session.attachDetailsLink,
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
      participants: [...currentData.participants, { name: '', weight: 1 }],
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:underline">
            ← トップに戻る
          </a>
        </div>

        <h1 className="text-3xl font-bold mb-8">{session.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タイトル *</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={currentData.title}
              onChange={(e) => setFormData({ ...currentData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">合計金額（円）*</label>
            <input
              type="number"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={currentData.totalAmount}
              onChange={(e) =>
                setFormData({
                  ...currentData,
                  totalAmount: parseInt(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">参加者 *</label>
            <div className="space-y-3">
              {currentData.participants.map((p, index) => (
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
                  {currentData.participants.length > 1 && (
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
              value={currentData.messageTemplate}
              onChange={(e) => setFormData({ ...currentData, messageTemplate: e.target.value })}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={currentData.attachDetailsLink}
                onChange={(e) =>
                  setFormData({ ...currentData, attachDetailsLink: e.target.checked })
                }
              />
              <span className="text-sm font-medium text-gray-700">計算方法の説明リンクを添付</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? '更新中...' : '計算・更新'}
          </button>
        </form>

        {/* 計算結果表示 */}
        {session.participants.some((p) => p.shareAmount !== null) && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">計算結果</h2>
            <div className="space-y-4">
              {session.participants.map((p) => {
                if (p.shareAmount === null) return null;
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
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-gray-600 ml-2">(重み: {p.weight})</span>
                      </div>
                      <div className="text-xl font-bold">{p.shareAmount.toLocaleString()}円</div>
                    </div>
                    <div className="bg-gray-50 rounded p-3 mb-3 text-sm whitespace-pre-wrap">
                      {message}
                    </div>
                    <a
                      href={lineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      LINEで送る
                    </a>
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold">
                  <span>合計</span>
                  <span>
                    {session.participants
                      .reduce((sum, p) => sum + (p.shareAmount || 0), 0)
                      .toLocaleString()}
                    円
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => {
              if (confirm('本当に削除しますか？')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? '削除中...' : 'セッションを削除'}
          </button>
        </div>
      </div>
    </div>
  );
}
