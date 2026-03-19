document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche la page de se recharger

    const fileInput = document.getElementById('foodImage');
    const resultArea = document.getElementById('resultArea');
    const foodNameEl = document.getElementById('foodName');
    const confidenceScoreEl = document.getElementById('confidenceScore');
    const submitBtn = document.getElementById('submitBtn');

    if (fileInput.files.length === 0) return;

    // 1. Mettre l'interface en mode "Chargement"
    submitBtn.disabled = true;
    submitBtn.innerText = "🧠 Analyse en cours par l'IA...";
    resultArea.style.display = "block";
    foodNameEl.innerText = "Recherche dans la base...";
    foodNameEl.style.color = "#34495e";
    confidenceScoreEl.innerText = "-";

    // 2. Préparer l'image pour l'envoi
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    try {
        // 3. Envoyer l'image à ton API FastAPI locale
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            body: formData
        });

        // 4. Lire la réponse JSON
        const data = await response.json();

        if (data.status === "success") {
            // Mettre la première lettre en majuscule pour faire plus propre
            const platName = data.prediction.charAt(0).toUpperCase() + data.prediction.slice(1);
            
            // Afficher les données
            foodNameEl.innerText = platName;
            foodNameEl.style.color = "#27ae60"; // Vert succès
            confidenceScoreEl.innerText = data.confidence_percent;
        } else {
            foodNameEl.innerText = "Erreur IA : " + data.message;
            foodNameEl.style.color = "#e74c3c"; // Rouge erreur
        }

    } catch (error) {
        console.error("Erreur de connexion:", error);
        foodNameEl.innerText = "Impossible de joindre l'API. Uvicorn tourne-t-il ?";
        foodNameEl.style.color = "#e74c3c";
    } finally {
        // 5. Remettre le bouton à la normale
        submitBtn.disabled = false;
        submitBtn.innerText = "Analyser une autre image";
    }
});