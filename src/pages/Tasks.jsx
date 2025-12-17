import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';
import { getTasks, updateTask, deleteTask } from '../db/tasks';
import { getSettings } from '../db/settings';
import { sendDiscordWebhook, createTaskCompletedEmbed, createTaskCancelledEmbed } from '../utils/discord';
import { Check, X, Edit, Trash2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const data = await getTasks(user.id, { completed: false });
      setTasks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (task) => {
    try {
      const updatedTask = await updateTask(task.id, { completed: true });
      setTasks(tasks.filter(t => t.id !== task.id));

      // Envoyer webhook Discord
      const user = getCurrentUser();
      const settings = await getSettings(user.id);
      if (settings.discordWebhookUrl) {
        const embed = createTaskCompletedEmbed(updatedTask);
        await sendDiscordWebhook(settings.discordWebhookUrl, embed);
      }

      // Animation de confirmation
      // (l'animation est gérée par le retrait de l'élément de la liste)
    } catch (error) {
      console.error('Erreur lors de la complétion:', error);
      alert('Erreur lors de la complétion de la tâche');
    }
  };

  const handleDelete = async (task) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await deleteTask(task.id);
      setTasks(tasks.filter(t => t.id !== task.id));

      // Envoyer webhook Discord
      const user = getCurrentUser();
      const settings = await getSettings(user.id);
      if (settings.discordWebhookUrl) {
        const embed = createTaskCancelledEmbed(task);
        await sendDiscordWebhook(settings.discordWebhookUrl, embed);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la tâche');
    }
  };

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
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="EBT Logo" 
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-3xl font-bold">Mes tâches</h1>
        </div>
        <Link to="/tasks/add">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black p-3 rounded-full"
          >
            <Plus size={24} />
          </motion.button>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 mb-4">Aucune tâche en cours</p>
          <Link to="/tasks/add">
            <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold">
              Créer ma première tâche
            </button>
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
              className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                      <span className="font-semibold">{task.amount?.toFixed(2) || '0.00'}€</span>
                    </div>
                    {task.deadline && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span>
                          {format(new Date(task.deadline), "d MMM yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {task.imageUrl && (
                  <img
                    src={task.imageUrl}
                    alt={task.title}
                    className="w-20 h-20 object-cover rounded-lg ml-4"
                  />
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleComplete(task)}
                  className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                >
                  <Check size={20} />
                  Valider
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/tasks/edit/${task.id}`)}
                  className="bg-ebt-gray-light text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-ebt-gray-light/80 transition-colors"
                >
                  <Edit size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(task)}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

