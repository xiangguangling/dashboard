export default function Header({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`relative flex-shrink-0 px-4 md:px-6 border-b border-border-subtle overflow-visible ${compact ? 'py-2.5 mb-1' : 'py-4 mb-2'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[180px] bg-gradient-to-r from-accent-blue/8 via-accent-purple/5 to-accent-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto flex flex-col items-center gap-1">
        <h1 className={`font-extrabold tracking-widest text-center leading-tight ${compact ? 'text-[1.625rem] md:text-[2rem]' : 'text-[2rem] md:text-[3rem]'}`}>
          <span className="bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple bg-clip-text text-transparent animate-pulse-glow">
            义务教育标准化学校监测
          </span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent-blue/40" />
          <h2 className={`font-semibold text-text-secondary text-center leading-tight tracking-wide ${compact ? 'text-[1.125rem] md:text-[1.25rem]' : 'text-[1.375rem] md:text-[1.75rem]'}`}>
            数据可视化看板
          </h2>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent-blue/40" />
        </div>
      </div>
    </header>
  );
}
