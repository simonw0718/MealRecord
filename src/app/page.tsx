"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodaySummary, getLogsByDate, getSettings } from "@/lib/db";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState({ calories: 0, protein: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState({ dailyCalorieTarget: 2000, dailyProteinTarget: 150 });

  const loadData = async () => {
    try {
      // Use local date string to match how we save data
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-CA');

      const [todaySummary, todayLogs, userSettings] = await Promise.all([
        getTodaySummary(dateStr),
        getLogsByDate(dateStr),
        getSettings()
      ]);

      setSummary(todaySummary);
      setLogs(todayLogs);
      setSettings(userSettings);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex flex-col min-h-screen bg-slate-900 text-slate-50 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Today</h1>
          <p className="text-slate-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <button className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 transition">
          <Settings size={20} />
        </button>
      </header>

      {/* Progress Rings Section */}
      <section className="px-6 py-4 grid grid-cols-2 gap-4">
        <ProgressCard
          label="Calories"
          current={summary.calories}
          target={settings.dailyCalorieTarget}
          unit="kcal"
          color="text-orange-400"
          ringColor="stroke-orange-500"
        />
        <ProgressCard
          label="Protein"
          current={summary.protein}
          target={settings.dailyProteinTarget}
          unit="g"
          color="text-blue-400"
          ringColor="stroke-blue-500"
        />
      </section>

      {/* Recent Logs List */}
      <section className="flex-1 px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meals</h2>
          <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
            {logs.length} entries
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">No meals logged today</div>
        ) : (
          <div className="space-y-3 pb-24">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-200">{log.name}</span>
                  <div className="text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-orange-300">{log.calories} kcal</div>
                  <div className="text-xs text-blue-300 font-medium">{log.protein}g P</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => router.push('/add')}
          className="flex items-center justify-center w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-white"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>
    </main>
  );
}

function ProgressCard({
  label, current, target, unit, color, ringColor
}: {
  label: string; current: number; target: number; unit: string; color: string; ringColor: string
}) {
  // Prevent division by zero
  const safeTarget = target > 0 ? target : 1;
  const percentage = Math.min(100, Math.round((current / safeTarget) * 100));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-slate-800/50 rounded-3xl p-5 border border-slate-700/50 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-700"
          />
          {/* Progress Ring */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", ringColor)}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn("text-xl font-bold font-mono", color)}>{current}</span>
          <span className="text-[10px] text-slate-500 uppercase font-bold">{unit}</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="text-xs text-slate-500">{target - current} remaining</p>
      </div>
    </div>
  );
}
