import { useState } from "react";
import { Camera, LogOut, Save } from "lucide-react";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";

export function Profile() {
  // État du profil
  const [profile, setProfile] = useState({
    name: "Marie Dupont",
    goal: "weight-loss",
    budget: "medium",
    allergies: {
      gluten: false,
      lactose: false,
      nuts: true,
      shellfish: false,
      eggs: false,
    },
    equipment: {
      gym: false,
      dumbbells: true,
      none: false,
    },
  });

  const handleSave = () => {
    // Logique de sauvegarde (à implémenter avec l'API)
    console.log("Profil sauvegardé:", profile);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-8">
      {/* En-tête */}
      <header className="mb-6">
        <h1 className="text-[#1E3A5F] text-2xl font-bold">Mon Profil</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Personnalisez vos préférences et objectifs
        </p>
      </header>

      {/* Photo de profil */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white text-3xl font-bold">
            MD
          </div>
          <button
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#2563EB] transition-colors"
            aria-label="Changer la photo de profil"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-[#1E3A5F] text-xl font-semibold mt-3">
          {profile.name}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="text-[#1E3A5F] font-semibold mb-4">
            Informations personnelles
          </h3>
          <div>
            <Label htmlFor="name" className="text-[#2C3E50] mb-2 block">
              Nom complet
            </Label>
            <input
              id="name"
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#10B981] text-[#2C3E50]"
            />
          </div>
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="text-[#1E3A5F] font-semibold mb-4">Mes Objectifs</h3>
          <div>
            <Label htmlFor="goal" className="text-[#2C3E50] mb-2 block">
              Objectif principal
            </Label>
            <select
              id="goal"
              value={profile.goal}
              onChange={(e) =>
                setProfile({ ...profile, goal: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#10B981] text-[#2C3E50] bg-white"
            >
              <option value="weight-loss">Perte de poids</option>
              <option value="muscle-gain">Prise de masse musculaire</option>
              <option value="maintenance">Maintien de forme</option>
              <option value="endurance">Amélioration endurance</option>
              <option value="flexibility">Amélioration souplesse</option>
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="text-[#1E3A5F] font-semibold mb-4">
            Budget alimentaire
          </h3>
          <div>
            <Label htmlFor="budget" className="text-[#2C3E50] mb-2 block">
              Budget par repas
            </Label>
            <select
              id="budget"
              value={profile.budget}
              onChange={(e) =>
                setProfile({ ...profile, budget: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#10B981] text-[#2C3E50] bg-white"
            >
              <option value="low">Économique ({"<"}5€)</option>
              <option value="medium">Modéré (5-10€)</option>
              <option value="high">Élevé ({">"}10€)</option>
            </select>
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="text-[#1E3A5F] font-semibold mb-4">
            Mes Contraintes Alimentaires
          </h3>
          <div className="space-y-3">
            {[
              { id: "gluten", label: "Gluten" },
              { id: "lactose", label: "Lactose" },
              { id: "nuts", label: "Arachides / Fruits à coque" },
              { id: "shellfish", label: "Fruits de mer" },
              { id: "eggs", label: "Œufs" },
            ].map((allergy) => (
              <div key={allergy.id} className="flex items-center gap-3">
                <Checkbox
                  id={allergy.id}
                  checked={profile.allergies[allergy.id as keyof typeof profile.allergies]}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      allergies: {
                        ...profile.allergies,
                        [allergy.id]: checked === true,
                      },
                    })
                  }
                  className="border-2 border-[#E5E7EB] data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]"
                />
                <Label
                  htmlFor={allergy.id}
                  className="text-[#2C3E50] cursor-pointer"
                >
                  {allergy.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Équipement sportif */}
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="text-[#1E3A5F] font-semibold mb-4">
            Équipement Sportif Disponible
          </h3>
          <div className="space-y-3">
            {[
              { id: "gym", label: "Accès à une salle de sport" },
              { id: "dumbbells", label: "Haltères / Poids libres" },
              { id: "none", label: "Aucun matériel" },
            ].map((equipment) => (
              <div key={equipment.id} className="flex items-center gap-3">
                <Checkbox
                  id={equipment.id}
                  checked={
                    profile.equipment[equipment.id as keyof typeof profile.equipment]
                  }
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      equipment: {
                        ...profile.equipment,
                        [equipment.id]: checked === true,
                      },
                    })
                  }
                  className="border-2 border-[#E5E7EB] data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]"
                />
                <Label
                  htmlFor={equipment.id}
                  className="text-[#2C3E50] cursor-pointer"
                >
                  {equipment.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSave}
            className="w-full bg-[#10B981] text-white py-3 rounded-xl font-semibold hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Save className="w-5 h-5" aria-hidden="true" />
            Enregistrer les modifications
          </button>
          <button className="w-full bg-white text-[#EF4444] border-2 border-[#EF4444] py-3 rounded-xl font-semibold hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
