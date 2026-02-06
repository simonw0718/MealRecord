"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Flame, Beef } from "lucide-react";
import { addLog } from "@/lib/db";
import { cn } from "@/lib/utils";

export default function AddPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        calories: "",
        protein: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.calories && !formData.protein) return;

        setLoading(true);
        try {
            const now = new Date();
            // Format YYYY-MM-DD locally
            const dateStr = now.toLocaleDateString('en-CA');

            await addLog({
                name: formData.name || "Quick Add",
                calories: Number(formData.calories) || 0,
                protein: Number(formData.protein) || 0,
                timestamp: now.getTime(),
                dateStr,
            });

            router.push("/");
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
            {/* Header */}
            <header className="flex items-center p-4 border-b border-slate-800">
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-800">
                    <ArrowLeft size={24} className="text-slate-400" />
                </button>
                <h1 className="ml-4 text-xl font-bold">Add Entry</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-6">

                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">What did you eat?</label>
                    <input
                        type="text"
                        placeholder="e.g. Banana, Chicken Breast"
                        className="w-full bg-slate-800 border-none rounded-xl p-4 text-lg placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                {/* Calories Input */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <Flame size={20} />
                            <span className="font-bold">Calories</span>
                        </div>
                        <input
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            className="w-full bg-slate-800/50 border-2 border-slate-800 rounded-2xl p-6 text-3xl font-mono text-center focus:border-orange-500 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-700"
                            value={formData.calories}
                            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Beef size={20} />
                            <span className="font-bold">Protein (g)</span>
                        </div>
                        <input
                            type="number"
                            inputMode="numeric"
                            placeholder="0"
                            className="w-full bg-slate-800/50 border-2 border-slate-800 rounded-2xl p-6 text-3xl font-mono text-center focus:border-blue-500 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-700"
                            value={formData.protein}
                            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-bold text-lg text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                >
                    <Check size={24} />
                    {loading ? "Saving..." : "Save Entry"}
                </button>
            </form>
        </div>
    );
}
