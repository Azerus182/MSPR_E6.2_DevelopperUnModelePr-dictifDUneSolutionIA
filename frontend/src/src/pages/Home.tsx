import { Bell, Camera } from "lucide-react";
import { Link } from "react-router";
import { Progress } from "../components/ui/progress";

export function Home() {
  // Données mockées
  const userName = "Marie";
  const caloriesConsumed = 1450;
  const caloriesGoal = 2000;
  const caloriesProgress = (caloriesConsumed / caloriesGoal) * 100;
  
  const macros = [
    { name: "Protéines", consumed: 85, goal: 120, unit: "g", color: "#10B981" },
    { name: "Glucides", consumed: 160, goal: 200, unit: "g", color: "#3B82F6" },
    { name: "Lipides", consumed: 45, goal: 60, unit: "g", color: "#F59E0B" },
  ];

  const nextActivity = {
    name: "Séance Haut du corps",
    duration: "45 min",
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* En-tête */}
      <header className="flex flex-col gap-4 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[#1E3A5F] text-xl">
              Bonjour <span className="font-semibold">{userName}</span> !<br />
              Prêt(e) pour tes objectifs du jour ?
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">Connecte-toi pour synchroniser ton programme.</p>
          </div>
          <button 
            className="relative p-2 text-[#2C3E50] hover:text-[#10B981] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full" aria-hidden="true"></span>
          </button>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#10B981] text-[#10B981] hover:bg-[#ECFDF5] transition"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#10B981] text-white hover:bg-[#059669] transition"
          >
            S'inscrire
          </Link>
        </div>
      </header>

      {/* Action Principale */}
      <button className="w-full bg-[#10B981] text-white rounded-2xl p-6 mb-8 shadow-lg hover:bg-[#059669] transition-colors active:scale-98 flex items-center justify-center gap-3">
        <Camera className="w-8 h-8" aria-hidden="true" />
        <span className="text-lg font-semibold">📸 Analyser mon repas</span>
      </button>

      {/* Jauge circulaire centrale */}
      <div className="flex flex-col items-center mb-8 bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-[#1E3A5F] text-lg font-semibold mb-4">Calories du jour</h2>
        <div className="relative w-48 h-48 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#E5E7EB"
              strokeWidth="16"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="#10B981"
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - caloriesProgress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#1E3A5F]">{caloriesConsumed}</span>
            <span className="text-sm text-[#6B7280]">/ {caloriesGoal} kcal</span>
          </div>
        </div>
        <p className="text-[#2C3E50] text-sm">
          {caloriesGoal - caloriesConsumed} kcal restantes
        </p>
      </div>

      {/* Macros */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <h2 className="text-[#1E3A5F] text-lg font-semibold mb-4">Macronutriments</h2>
        <div className="space-y-4">
          {macros.map((macro) => {
            const progress = (macro.consumed / macro.goal) * 100;
            return (
              <div key={macro.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-[#2C3E50] font-medium">{macro.name}</span>
                  <span className="text-[#6B7280] text-sm">
                    {macro.consumed}{macro.unit} / {macro.goal}{macro.unit}
                  </span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: macro.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aperçu Rapide */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-[#1E3A5F] text-lg font-semibold mb-3">Prochaine activité</h2>
        <div className="flex items-center gap-3 p-4 bg-[#EFF6FF] rounded-xl border-l-4 border-[#3B82F6]">
          <div className="w-12 h-12 bg-[#3B82F6] rounded-full flex items-center justify-center text-white text-2xl">
            💪
          </div>
          <div>
            <p className="text-[#1E3A5F] font-semibold">{nextActivity.name}</p>
            <p className="text-[#6B7280] text-sm">{nextActivity.duration}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
