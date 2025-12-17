import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] p-8 shadow-2xl"
      >
        <h1 className="mb-2 text-center text-3xl font-bold text-white">EBT</h1>
        <p className="mb-8 text-center text-sm text-[#888888]">
          Easy Business Task
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#888888]">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full bg-black border border-[#1a1a1a] rounded-lg px-4 py-3 text-white placeholder-[#444444] focus:border-white focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#888888]">
              Mot de passe
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#1a1a1a] rounded-lg px-4 py-3 text-white placeholder-[#444444] focus:border-white focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-[#1a0a0a] border border-[#ef4444] p-3 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 text-base font-semibold text-black transition-all hover:bg-[#e5e5e5] focus:outline-none disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <p className="text-center text-sm text-[#888888]">
            Pas de compte ?{" "}
            <a
              href={`/account/signup${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="text-white hover:text-[#e5e5e5] font-medium"
            >
              S'inscrire
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
