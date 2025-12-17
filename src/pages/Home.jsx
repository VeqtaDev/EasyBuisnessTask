import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';
import { getTaskStats } from '../db/tasks';
import { Plus, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const data = await getTaskStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-ebt-gray rounded-2xl"></div>
          <div className="h-32 bg-ebt-gray rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <img 
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="EBT Logo" 
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h1 className="text-4xl font-bold mb-2">EBT</h1>
        <p className="text-gray-400">Easy Business Task</p>
      </motion.div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">💰 Argent gagné ce mois</h2>
            <TrendingUp className="text-green-400" size={24} />
          </div>
          <p className="text-3xl font-bold">
            {stats?.earnedThisMonth?.toFixed(2) || '0.00'}€
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📈 Argent prévu d'ici la fin du mois</h2>
            <Calendar className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold">
            {stats?.projectedEndOfMonth?.toFixed(2) || '0.00'}€
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {stats?.pendingAmount?.toFixed(2) || '0.00'}€ en attente
          </p>
        </motion.div>
      </div>

      {/* Résumé rapide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
      >
        <h2 className="text-lg font-semibold mb-4">Résumé</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats?.completedThisMonth || 0}</p>
            <p className="text-sm text-gray-400">Tâches complétées</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.pendingTasks || 0}</p>
            <p className="text-sm text-gray-400">Tâches en cours</p>
          </div>
        </div>
      </motion.div>

      {/* Actions rapides */}
      <Link to="/tasks/add">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white text-black py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          <Plus size={24} />
          Créer une nouvelle tâche
        </motion.button>
      </Link>

      <div className="text-center text-gray-400 text-sm">
        {format(new Date(), "EEEE d MMMM yyyy")}
      </div>
    </div>
  );
}

