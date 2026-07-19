export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <h1 className="text-6xl font-bold mb-8 text-center text-emerald-800 dark:text-emerald-400">Stadium Copilot</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-12 text-center max-w-md">
        Your AI guide for today&apos;s match.
      </p>
      <a 
        href="/copilot" 
        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xl font-bold shadow-lg transition-colors focus:ring-4 focus:ring-emerald-400 focus:outline-none mb-6 w-full max-w-xs text-center"
      >
        Talk to Copilot
      </a>
      <a 
        href="/staff" 
        className="text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1 outline-none"
      >
        Staff sign-in
      </a>
    </main>
  );
}
