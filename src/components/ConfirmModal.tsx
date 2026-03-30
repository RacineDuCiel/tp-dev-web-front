interface Props {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
