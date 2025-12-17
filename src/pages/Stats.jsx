import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';
import { getTaskStats } from '../db/tasks';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, DollarSign, CheckCircle, Calendar, Target, ArrowUp, ArrowDown } from 'lucide-react';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly

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
          <div className="h-64 bg-ebt-gray rounded-2xl"></div>
          <div className="h-64 bg-ebt-gray rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const chartData = viewMode === 'daily' 
    ? stats?.dailyStats || []
    : viewMode === 'weekly'
    ? stats?.weeklyStats || []
    : stats?.monthlyStats || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`} 
            alt="EBT Logo" 
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-3xl font-bold">Statistiques</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'daily'
                ? 'bg-white text-black'
                : 'bg-ebt-gray-light text-gray-400 hover:text-white'
            }`}
          >
            Journalier
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'weekly'
                ? 'bg-white text-black'
                : 'bg-ebt-gray-light text-gray-400 hover:text-white'
            }`}
          >
            Hebdomadaire
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'monthly'
                ? 'bg-white text-black'
                : 'bg-ebt-gray-light text-gray-400 hover:text-white'
            }`}
          >
            Mensuel
          </button>
        </div>
      </div>

      {/* Cartes de résumé principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">Gagné ce mois</h3>
            <DollarSign className="text-green-400" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {stats?.earnedThisMonth?.toFixed(2) || '0.00'}€
          </p>
          {stats?.monthProgress !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              {stats.monthProgress >= 0 ? (
                <ArrowUp className="text-green-400" size={16} />
              ) : (
                <ArrowDown className="text-red-400" size={16} />
              )}
              <span className={stats.monthProgress >= 0 ? 'text-green-400' : 'text-red-400'}>
                {Math.abs(stats.monthProgress).toFixed(1)}% vs mois dernier
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">Total gagné</h3>
            <TrendingUp className="text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {stats?.totalEarned?.toFixed(2) || '0.00'}€
          </p>
          <p className="text-sm text-gray-400">
            {stats?.totalCompleted || 0} tâches complétées
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">Moyenne par tâche</h3>
            <Target className="text-purple-400" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {stats?.averageCompletedAmount?.toFixed(2) || '0.00'}€
          </p>
          <p className="text-sm text-gray-400">
            Tâches complétées uniquement
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">En attente</h3>
            <Calendar className="text-yellow-400" size={20} />
          </div>
          <p className="text-3xl font-bold mb-2">
            {stats?.pendingAmount?.toFixed(2) || '0.00'}€
          </p>
          <p className="text-sm text-gray-400">
            {stats?.pendingTasks || 0} tâches en cours
          </p>
        </motion.div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <h3 className="text-lg font-semibold mb-4">Cette semaine</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Revenus</span>
              <span className="font-semibold">{stats?.earnedThisWeek?.toFixed(2) || '0.00'}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tâches complétées</span>
              <span className="font-semibold">{stats?.completedThisWeek || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <h3 className="text-lg font-semibold mb-4">Ce mois</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Revenus</span>
              <span className="font-semibold">{stats?.earnedThisMonth?.toFixed(2) || '0.00'}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tâches complétées</span>
              <span className="font-semibold">{stats?.completedThisMonth || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Projection fin de mois</span>
              <span className="font-semibold text-green-400">
                {stats?.projectedEndOfMonth?.toFixed(2) || '0.00'}€
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
        >
          <h3 className="text-lg font-semibold mb-4">Vue d'ensemble</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total tâches</span>
              <span className="font-semibold">{stats?.totalTasks || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Taux de complétion</span>
              <span className="font-semibold">
                {stats?.totalTasks > 0 
                  ? ((stats.totalCompleted / stats.totalTasks) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Moyenne générale</span>
              <span className="font-semibold">{stats?.averageTaskAmount?.toFixed(2) || '0.00'}€</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graphiques */}
      {chartData.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
          >
            <h2 className="text-xl font-semibold mb-6">Évolution des revenus</h2>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (viewMode === 'daily') {
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    } else if (viewMode === 'weekly') {
                      return `S${Math.ceil(date.getDate() / 7)}`;
                    } else {
                      return `${date.getMonth() + 1}/${date.getFullYear()}`;
                    }
                  }}
                />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value.toFixed(2)}€`, 'Montant']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#FFFFFF"
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
          >
            <h2 className="text-xl font-semibold mb-6">Nombre de tâches complétées</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    if (viewMode === 'daily') {
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    } else if (viewMode === 'weekly') {
                      return `S${Math.ceil(date.getDate() / 7)}`;
                    } else {
                      return `${date.getMonth() + 1}/${date.getFullYear()}`;
                    }
                  }}
                />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#FFFFFF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-ebt-gray rounded-2xl border border-ebt-gray-light"
        >
          <p className="text-gray-400">Aucune donnée à afficher</p>
          <p className="text-gray-500 text-sm mt-2">
            Complétez des tâches pour voir vos statistiques
          </p>
        </motion.div>
      )}
    </div>
  );
}
