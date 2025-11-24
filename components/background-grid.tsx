export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black">
      {/* Dot grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Radial gradient overlay for fade effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-white dark:from-transparent dark:via-black/50 dark:to-black"></div>

      {/* Top glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
}
