import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';
import { getTasks, deleteTask } from '../db/tasks';
import { getSettings } from '../db/settings';
import { sendDiscordWebhook, createTaskCancelledEmbed } from '../utils/discord';
import { Calendar, Euro, TrendingUp, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function History() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('completedAt');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [sortBy]);

  const loadTasks = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const data = await getTasks(user.id, { completed: true, sortBy });
      setTasks(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette tâche ?\n\nCela annulera ${task.amount?.toFixed(2) || '0.00'}€ de vos revenus.`)) {
      return;
    }

    setDeletingId(task.id);
    try {
      await deleteTask(task.id);
      setTasks(tasks.filter(t => t.id !== task.id));

      // Envoyer webhook Discord si configuré
      const user = getCurrentUser();
      const settings = await getSettings(user.id);
      if (settings.discordWebhookUrl) {
        const embed = createTaskCancelledEmbed(task);
        await sendDiscordWebhook(settings.discordWebhookUrl, embed);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la tâche');
    } finally {
      setDeletingId(null);
    }
  };

  const totalEarned = tasks.reduce((sum, task) => sum + (task.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-ebt-gray rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Historique</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-ebt-gray-light border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option value="completedAt">Par date</option>
          <option value="amount">Par montant</option>
        </select>
      </div>

      {/* Total gagné */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total gagné</p>
            <p className="text-3xl font-bold">{totalEarned.toFixed(2)}€</p>
          </div>
          <TrendingUp className="text-green-400" size={32} />
        </div>
      </motion.div>

      {/* Avertissement */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-yellow-300">
            <p className="font-semibold mb-1">Attention</p>
            <p>La suppression d'une tâche complétée annulera l'argent qu'elle vous a rapporté. Cette action est irréversible.</p>
          </div>
        </motion.div>
      )}

      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400">Aucune tâche complétée</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                transition={{ delay: index * 0.05 }}
                className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <Euro size={16} />
                        <span className="font-semibold">{task.amount?.toFixed(2) || '0.00'}€</span>
                      </div>
                      {task.completedAt && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={16} />
                          <span>
                            Complétée le {format(new Date(task.completedAt), "d MMM yyyy 'à' HH:mm")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 ml-4">
                    {task.imageUrl && (
                      <img
                        src={task.imageUrl}
                        alt={task.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(task)}
                      disabled={deletingId === task.id}
                      className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Supprimer cette tâche (annule l'argent gagné)"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
