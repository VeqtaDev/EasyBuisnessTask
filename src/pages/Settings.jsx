import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../utils/auth';
import { getSettings, updateSettings, generateApiKeyForUser } from '../db/settings';
import { Copy, Check, Key, Webhook } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const data = await getSettings(user.id);
      setSettings(data);
      setWebhookUrl(data.discordWebhookUrl || '');
      setApiKey(data.apiKey || '');
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWebhook = async () => {
    const user = getCurrentUser();
    if (!user) return;

    setSaving(true);
    try {
      await updateSettings(user.id, { discordWebhookUrl: webhookUrl });
      setSettings(await getSettings(user.id));
      alert('Webhook Discord enregistré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      const key = await generateApiKeyForUser(user.id);
      setApiKey(key);
      setSettings(await getSettings(user.id));
      alert('Clé API générée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      alert('Erreur lors de la génération de la clé API');
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="flex items-center gap-4 mb-6">
        <img 
          src={`${import.meta.env.BASE_URL}logo.png`} 
          alt="EBT Logo" 
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      {/* Webhook Discord */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
      >
        <div className="flex items-center gap-3 mb-4">
          <Webhook className="text-blue-400" size={24} />
          <h2 className="text-xl font-semibold">Webhook Discord</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Configurez un webhook Discord pour recevoir des notifications lors de la création,
          complétion ou annulation de tâches.
        </p>
        <div className="space-y-4">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full px-4 py-3 bg-ebt-gray-light rounded-lg border border-gray-700 focus:border-white focus:outline-none transition-colors text-white"
          />
          <button
            onClick={handleSaveWebhook}
            disabled={saving}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer le webhook'}
          </button>
        </div>
      </motion.div>

      {/* API Key */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
      >
        <div className="flex items-center gap-3 mb-4">
          <Key className="text-purple-400" size={24} />
          <h2 className="text-xl font-semibold">Clé API</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Générez une clé API pour accéder à vos données via des outils externes ou des
          automatisations.
        </p>
        <div className="space-y-4">
          {apiKey ? (
            <div className="relative">
              <input
                type="text"
                value={apiKey}
                readOnly
                className="w-full px-4 py-3 bg-ebt-gray-light rounded-lg border border-gray-700 text-white pr-12"
              />
              <button
                onClick={handleCopyApiKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-ebt-gray rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="text-green-400" size={20} />
                ) : (
                  <Copy className="text-gray-400" size={20} />
                )}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aucune clé API générée</p>
          )}
          <button
            onClick={handleGenerateApiKey}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            {apiKey ? 'Régénérer la clé API' : 'Générer une clé API'}
          </button>
        </div>
      </motion.div>

      {/* Documentation API */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-ebt-gray rounded-2xl p-6 border border-ebt-gray-light"
      >
        <h2 className="text-xl font-semibold mb-4">Documentation API</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            <strong className="text-white">GET /api/tasks</strong> - Récupérer toutes les tâches
          </p>
          <p>
            <strong className="text-white">POST /api/tasks</strong> - Créer une tâche
          </p>
          <p>
            <strong className="text-white">PUT /api/tasks/:id</strong> - Mettre à jour une tâche
          </p>
          <p>
            <strong className="text-white">DELETE /api/tasks/:id</strong> - Supprimer une tâche
          </p>
          <p>
            <strong className="text-white">GET /api/stats</strong> - Récupérer les statistiques
          </p>
          <p className="mt-4 text-xs">
            Utilisez l'en-tête <code className="bg-ebt-gray-light px-2 py-1 rounded">
              Authorization: Bearer ebt-xxxxx
            </code> pour authentifier vos requêtes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

