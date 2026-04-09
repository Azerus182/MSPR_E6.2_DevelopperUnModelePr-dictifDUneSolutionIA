import { useState } from "react";
import { useNavigate, Link } from "react-router";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Impossible de se connecter.");
        return;
      }

      localStorage.setItem("authToken", data.token);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Impossible de joindre le service d'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-[#1E3A5F] text-2xl font-bold">Connexion</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Rentre tes identifiants pour accéder à ton espace.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-3xl p-6 shadow-md">
        <label className="block">
          <span className="text-sm font-medium text-[#2C3E50]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#2C3E50]">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </label>

        {error && <p className="text-sm text-[#EF4444]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#10B981] py-3 text-white font-semibold shadow-lg transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-sm text-[#6B7280] text-center">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-[#10B981] font-medium hover:underline">
            Inscris-toi
          </Link>
        </p>
      </form>
    </div>
  );
}
