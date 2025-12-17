import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';
import { createTask } from '../db/tasks';
import { getSettings } from '../db/settings';
import { sendDiscordWebhook, createTaskCreatedEmbed } from '../utils/discord';
import { ArrowLeft, Upload } from 'lucide-react';

export default function AddTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Le titre est requis');
      return;
    }

    setLoading(true);
    try {
      const user = getCurrentUser();
      const task = await createTask(user.id, {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        deadline: deadline || null,
        amount: parseFloat(amount) || 0,
      });

      // Envoyer webhook Discord
      const settings = await getSettings(user.id);
      if (settings.discordWebhookUrl) {
        const embed = createTaskCreatedEmbed(task);
        await sendDiscordWebhook(settings.discordWebhookUrl, embed);
      }

      navigate('/tasks');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 hover:bg-ebt-gray rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Nouvelle tâche</h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-ebt-gray rounded-lg border border-ebt-gray-light focus:border-white focus:outline-none transition-colors"
            placeholder="Nom de la tâche"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-ebt-gray rounded-lg border border-ebt-gray-light focus:border-white focus:outline-none transition-colors resize-none"
            placeholder="Description de la tâche..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image (URL)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-4 py-3 bg-ebt-gray rounded-lg border border-ebt-gray-light focus:border-white focus:outline-none transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Date limite</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-3 bg-ebt-gray rounded-lg border border-ebt-gray-light focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Montant gagné (€)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-ebt-gray rounded-lg border border-ebt-gray-light focus:border-white focus:outline-none transition-colors"
            placeholder="0.00"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création...' : 'Créer la tâche'}
        </button>
      </motion.form>
    </div>
  );
}

