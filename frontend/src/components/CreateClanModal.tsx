import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

interface CreateClanModalProps {
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateClanModal: React.FC<CreateClanModalProps> = ({
  token,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [roster, setRoster] = useState('');
  const [initialPoints, setInitialPoints] = useState(0);
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Загрузка файла...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/uploads/logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Ошибка загрузки файла');
      }

      const data = await res.json();
      setLogoUrl(data.url);
      setUploadStatus('✓ Логотип успешно загружен');
    } catch (err: any) {
      setUploadStatus(null);
      setError(err.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/clans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          tag: tag.trim().toUpperCase(),
          initial_points: initialPoints,
          roster: roster.trim() || null,
          description: description.trim() || null,
          logo_url: logoUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = 'Ошибка создания клана';
        if (typeof data.detail === 'string') {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          msg = data.detail
            .map((e: any) => `${e.loc && e.loc.length > 1 ? e.loc[e.loc.length - 1] + ': ' : ''}${e.msg}`)
            .join('; ');
        }
        throw new Error(msg);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/[0.1] bg-[#0c0d10] backdrop-blur-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white tracking-tight">Регистрация клана</h3>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 uppercase mb-1">Название клана:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Titan Esports"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Тег клана:</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              required
              placeholder="TITAN"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white uppercase focus:outline-none focus:border-white/40"
            />
          </div>

          {/* Logo upload from PC */}
          <div>
            <label className="block text-zinc-400 uppercase mb-1">Логотип клана (Файл с ПК):</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-zinc-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08] transition text-xs flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Загрузка...' : 'Выбрать файл...'}</span>
                </button>

                {uploadStatus && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{uploadStatus}</span>
                  </span>
                )}
                {!uploadStatus && (
                  <span className="text-[10px] text-zinc-500 block">PNG, JPG, WEBP до 5 MB</span>
                )}
              </div>
            </div>
          </div>

          {/* Roster text */}
          <div>
            <label className="block text-zinc-400 uppercase mb-1">
              Состав клана (ники через запятую):
            </label>
            <textarea
              value={roster}
              onChange={(e) => setRoster(e.target.value)}
              rows={2}
              placeholder="BeastLeader, RustAimGod, RocketMan, NightFarmer"
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-zinc-400 uppercase mb-1">
              <label>Стартовые очки (CRL):</label>
              <span className="text-[10px] text-zinc-500 font-sans">Старт 0, максимум 1 000 CRL</span>
            </div>
            <input
              type="number"
              min={0}
              max={1000}
              value={initialPoints}
              onChange={(e) => setInitialPoints(Math.min(1000, Math.max(0, parseInt(e.target.value, 10) || 0)))}
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-zinc-400 uppercase mb-1">Описание / инфо:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Краткое описание клана и базы..."
              className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white/40 font-sans"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-400 text-xs p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition font-sans mt-2 cursor-pointer shadow-xl disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Зарегистрировать клан'}
          </button>
        </form>
      </div>
    </div>
  );
};
