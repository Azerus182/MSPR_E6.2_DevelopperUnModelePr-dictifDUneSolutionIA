import { useState } from "react";
import { AlertCircle, Dumbbell, UtensilsCrossed, RotateCw, Camera, Upload, Sparkles, X } from "lucide-react";

type CoachMode = "nutrition" | "sport";

interface NutritionAnalysis {
  dishName: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  confidence: number;
}

export function Coach() {
  const [mode, setMode] = useState<CoachMode>("nutrition");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NutritionAnalysis | null>(null);

  // --- DONNÉES MOCKÉES (Celles qui manquaient !) ---
  const nutritionAlert = "L'IA a détecté un déficit en protéines hier.";
  
  const mealSuggestions = [
    {
      id: 1,
      name: "Salade de poulet grillé",
      calories: 450,
      proteins: 35,
      price: "~6€",
      time: "20 min",
    },
    {
      id: 2,
      name: "Bol de quinoa aux légumes",
      calories: 380,
      proteins: 15,
      price: "~4€",
      time: "25 min",
    },
    {
      id: 3,
      name: "Omelette aux épinards",
      calories: 320,
      proteins: 28,
      price: "~3€",
      time: "15 min",
    },
  ];

  const workoutPlan = [
    {
      id: 1,
      name: "Pompes",
      sets: "3 x 12",
      rest: "60s",
      target: "Pectoraux, triceps",
    },
    {
      id: 2,
      name: "Squats",
      sets: "4 x 15",
      rest: "60s",
      target: "Jambes, fessiers",
    },
    {
      id: 3,
      name: "Planche",
      sets: "3 x 45s",
      rest: "45s",
      target: "Core, abdominaux",
    },
    {
      id: 4,
      name: "Burpees",
      sets: "3 x 10",
      rest: "90s",
      target: "Corps entier",
    },
  ];

  // --- LOGIQUE DE L'APPLICATION ---
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    
    // Appel à l'API FastAPI
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.status === "success") {
            setAnalysisResult({
                dishName: data.prediction.charAt(0).toUpperCase() + data.prediction.slice(1),
                confidence: data.confidence_percent,
                calories: 0, // À relier à OpenFoodFacts plus tard
                proteins: 0,
                carbs: 0,
                fats: 0
            });
        } else {
            alert("Erreur de l'IA : " + data.message);
        }
    } catch (error) {
        console.error("Erreur de connexion:", error);
        alert("Impossible de joindre l'API Python. Est-elle lancée sur le port 5000 ?");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  // --- INTERFACE (JSX) ---
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-[#1E3A5F] text-2xl font-bold">Mon Coach IA</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Recommandations personnalisées pour vous
        </p>
      </header>

      {/* Toggle Nutrition / Sport */}
      <div className="flex bg-white rounded-xl p-1.5 mb-6 shadow-md">
        <button
          onClick={() => setMode("nutrition")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === "nutrition"
              ? "bg-[#10B981] text-white shadow-md"
              : "text-[#2C3E50] hover:bg-[#F3F4F6]"
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" aria-hidden="true" />
          Nutrition
        </button>
        <button
          onClick={() => setMode("sport")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            mode === "sport"
              ? "bg-[#10B981] text-white shadow-md"
              : "text-[#2C3E50] hover:bg-[#F3F4F6]"
          }`}
        >
          <Dumbbell className="w-5 h-5" aria-hidden="true" />
          Sport
        </button>
      </div>

      {/* Mode Nutrition */}
      {mode === "nutrition" && (
        <div className="space-y-6">
          {/* Analyse de plat par photo */}
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6" aria-hidden="true" />
              <h2 className="text-xl font-bold">Analyseur IA de plat</h2>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Prenez une photo de votre repas pour obtenir une analyse nutritionnelle complète
            </p>

            {!selectedImage ? (
              <div className="space-y-3">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="camera-input"
                  />
                  <div className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5" aria-hidden="true" />
                    Prendre une photo
                  </div>
                </label>

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="upload-input"
                  />
                  <div className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" aria-hidden="true" />
                    Télécharger une image
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Plat à analyser"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-2 right-2 w-8 h-8 bg-[#EF4444] rounded-full flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                    aria-label="Supprimer l'image"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {!analysisResult && (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isAnalyzing
                        ? "bg-white/40 text-white cursor-wait"
                        : "bg-white text-[#10B981] hover:bg-white/90"
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" aria-hidden="true" />
                        Analyser ce plat
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Résultats de l'analyse */}
          {analysisResult && (
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#10B981]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1E3A5F] text-xl font-bold">
                  Résultat de l'analyse
                </h3>
                <span className="px-3 py-1 bg-[#D1FAE5] text-[#059669] rounded-full text-xs font-semibold">
                  {analysisResult.confidence}% de précision
                </span>
              </div>

              <div className="mb-4 p-4 bg-[#F0FDF4] rounded-lg">
                <p className="text-[#2C3E50] text-sm mb-1">Plat détecté:</p>
                <p className="text-[#1E3A5F] text-2xl font-bold">
                  {analysisResult.dishName}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#FEF3C7] rounded-lg">
                  <span className="text-[#78350F] font-medium">Calories</span>
                  <span className="text-[#92400E] text-xl font-bold">
                    {analysisResult.calories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-[#DBEAFE] rounded-lg text-center">
                    <p className="text-[#1E40AF] text-xs mb-1">Protéines</p>
                    <p className="text-[#1E3A5F] text-lg font-bold">
                      {analysisResult.proteins}g
                    </p>
                  </div>
                  <div className="p-3 bg-[#FCE7F3] rounded-lg text-center">
                    <p className="text-[#9F1239] text-xs mb-1">Glucides</p>
                    <p className="text-[#1E3A5F] text-lg font-bold">
                      {analysisResult.carbs}g
                    </p>
                  </div>
                  <div className="p-3 bg-[#FED7AA] rounded-lg text-center">
                    <p className="text-[#9A3412] text-xs mb-1">Lipides</p>
                    <p className="text-[#1E3A5F] text-lg font-bold">
                      {analysisResult.fats}g
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-4 bg-[#F3F4F6] text-[#2C3E50] py-2.5 rounded-lg font-medium hover:bg-[#E5E7EB] transition-colors"
              >
                Analyser un autre plat
              </button>
            </div>
          )}

          {/* Alerte IA */}
          <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-6 h-6 text-[#F59E0B] flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-[#92400E] font-semibold mb-1">Conseil IA</h3>
              <p className="text-[#78350F] text-sm">{nutritionAlert}</p>
            </div>
          </div>

          {/* Plan du jour */}
          <div>
            <h2 className="text-[#1E3A5F] text-lg font-semibold mb-4">
              Suggestions de repas pour aujourd'hui
            </h2>
            <div className="space-y-3">
              {mealSuggestions.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-[#1E3A5F] font-semibold mb-2">{meal.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-[#6B7280]">
                      <span className="font-medium">Calories:</span> {meal.calories} kcal
                    </div>
                    <div className="text-[#6B7280]">
                      <span className="font-medium">Protéines:</span> {meal.proteins}g
                    </div>
                    <div className="text-[#6B7280]">
                      <span className="font-medium">Budget:</span> {meal.price}
                    </div>
                    <div className="text-[#6B7280]">
                      <span className="font-medium">Temps:</span> {meal.time}
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-[#10B981] text-white py-2 rounded-lg font-medium hover:bg-[#059669] transition-colors">
                    Voir la recette
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode Sport */}
      {mode === "sport" && (
        <div className="space-y-6">
          {/* En-tête programme */}
          <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-2">Programme du jour</h2>
            <p className="text-sm opacity-90">
              Objectif: Perte de graisse • À domicile, sans matériel
            </p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                Durée: 45 min
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                Difficulté: Intermédiaire
              </span>
            </div>
          </div>

          {/* Liste des exercices */}
          <div>
            <h2 className="text-[#1E3A5F] text-lg font-semibold mb-4">Exercices</h2>
            <div className="space-y-3">
              {workoutPlan.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-white rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#1E3A5F] font-semibold mb-1">
                        {exercise.name}
                      </h3>
                      <div className="text-sm text-[#6B7280] space-y-1">
                        <p>
                          <span className="font-medium">Séries:</span> {exercise.sets}
                        </p>
                        <p>
                          <span className="font-medium">Repos:</span> {exercise.rest}
                        </p>
                        <p className="text-xs text-[#3B82F6]">
                          🎯 {exercise.target}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton ajuster */}
          <button className="w-full bg-white text-[#2C3E50] border-2 border-[#E5E7EB] rounded-xl py-3 px-4 font-semibold hover:border-[#10B981] hover:text-[#10B981] transition-colors flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5" aria-hidden="true" />
            Ajuster ma séance
          </button>
        </div>
      )}
    </div>
  );
}