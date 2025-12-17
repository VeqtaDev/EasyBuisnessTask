import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUser } from '../db/users';
import { setCurrentUser } from '../utils/auth';
import { UserPlus } from 'lucide-react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await createUser(username, email, password);
      setCurrentUser(user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-ebt-gray rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="EBT Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-3xl font-bold mb-2">EBT</h1>
            <p className="text-gray-400">Easy Business Task</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-ebt-gray-light rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-ebt-gray-light rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-ebt-gray-light rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              {loading ? 'Création...' : "S'inscrire"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-white hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

