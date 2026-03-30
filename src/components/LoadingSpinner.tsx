export default function LoadingSpinner({ fullPage = false }: { fullPage?: boolean }) {
  const spinner = (
    <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
