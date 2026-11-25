import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Store, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/"); // Redirige al Dashboard si es exitoso
    } catch (err) {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/40">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 h-11"
            >
              <rect
                x="8"
                y="20"
                width="32"
                height="20"
                rx="3"
                fill="#1E293B"
                stroke="#38BDF8"
                strokeWidth="2.5"
              />
              <rect
                x="13"
                y="27"
                width="9"
                height="13"
                rx="1.5"
                fill="#10B981"
              />
              <circle cx="19.5" cy="33.5" r="1" fill="#ECFDF5" />
              <rect
                x="26"
                y="27"
                width="9"
                height="7"
                rx="1.5"
                fill="#38BDF8"
              />
              <path
                d="M6 14L10 8H38L42 14V18C42 20.2091 40.2091 22 38 22C35.7909 22 34 20.2091 34 18C34 20.2091 32.2091 22 30 22C27.7909 22 26 20.2091 26 18C26 20.2091 24.2091 22 22 22C19.7909 22 18 20.2091 18 18C18 20.2091 16.2091 22 14 22C11.7909 22 10 20.2091 10 18C10 20.2091 8.20914 22 6 22V14Z"
                fill="#F97316"
              />
              <path
                d="M14 8H20L18 18C18 20.2091 16.2091 22 14 22C11.7909 22 10 20.2091 10 18L14 8Z"
                fill="#FACC15"
              />
              <path
                d="M28 8H34L34 18C34 20.2091 32.2091 22 30 22C27.7909 22 26 20.2091 26 18L28 8Z"
                fill="#FACC15"
              />
            </svg>
          </div>
          <div className="leading-tight mb-2">
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              Abasto
            </h1>
            <span className="text-base font-bold text-emerald-400 tracking-wider uppercase">
              Eliomar
            </span>
          </div>

          <p className="text-gray-400 mt-2">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="usuario@tienda.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-950 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
