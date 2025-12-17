import { getDB } from './indexedDB';

export async function createTask(userId, taskData) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  
  const task = {
    userId,
    title: taskData.title,
    description: taskData.description || null,
    imageUrl: taskData.imageUrl || null,
    deadline: taskData.deadline || null,
    amount: parseFloat(taskData.amount) || 0,
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  const id = await tx.store.add(task);
  await tx.done;
  
  return { ...task, id };
}

export async function getTasks(userId, filters = {}) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readonly');
  let tasks = await tx.store.index('userId').getAll(userId);
  await tx.done;

  // Filtrer par statut
  if (filters.completed !== undefined) {
    tasks = tasks.filter(t => t.completed === filters.completed);
  }

  // Trier
  if (filters.sortBy === 'date') {
    tasks.sort((a, b) => {
      const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
      const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
      return dateA - dateB;
    });
  } else if (filters.sortBy === 'amount') {
    tasks.sort((a, b) => b.amount - a.amount);
  } else if (filters.sortBy === 'completedAt') {
    tasks.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
      const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
      return dateB - dateA;
    });
  } else {
    // Par défaut: tâches non complétées en premier, puis par deadline
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (!a.completed && !b.completed) {
        const dateA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
        const dateB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
        return dateA - dateB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  return tasks;
}

export async function getTaskById(id) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readonly');
  const task = await tx.store.get(id);
  await tx.done;
  return task;
}

export async function updateTask(id, updates) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  const task = await tx.store.get(id);
  
  if (!task) {
    throw new Error('Tâche non trouvée');
  }

  const updatedTask = {
    ...task,
    ...updates,
  };

  // Si on marque comme complétée, ajouter la date
  if (updates.completed === true && !task.completed) {
    updatedTask.completedAt = new Date().toISOString();
  } else if (updates.completed === false) {
    updatedTask.completedAt = null;
  }

  await tx.store.put(updatedTask);
  await tx.done;
  
  return updatedTask;
}

export async function deleteTask(id) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  await tx.store.delete(id);
  await tx.done;
}

export async function getTaskStats(userId) {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readonly');
  const allTasks = await tx.store.index('userId').getAll(userId);
  await tx.done;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const completedThisMonth = allTasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= startOfMonth && completedDate <= endOfMonth;
  });

  const completedLastMonth = allTasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= startOfLastMonth && completedDate <= endOfLastMonth;
  });

  const completedThisWeek = allTasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= startOfWeek;
  });

  const pendingTasks = allTasks.filter(task => !task.completed);
  const allCompleted = allTasks.filter(task => task.completed);

  const earnedThisMonth = completedThisMonth.reduce((sum, task) => sum + (task.amount || 0), 0);
  const earnedLastMonth = completedLastMonth.reduce((sum, task) => sum + (task.amount || 0), 0);
  const earnedThisWeek = completedThisWeek.reduce((sum, task) => sum + (task.amount || 0), 0);
  const pendingAmount = pendingTasks.reduce((sum, task) => sum + (task.amount || 0), 0);
  const totalEarned = allCompleted.reduce((sum, task) => sum + (task.amount || 0), 0);
  
  const avgAmount = allTasks.length > 0 
    ? allTasks.reduce((sum, task) => sum + (task.amount || 0), 0) / allTasks.length 
    : 0;

  const avgCompletedAmount = allCompleted.length > 0
    ? allCompleted.reduce((sum, task) => sum + (task.amount || 0), 0) / allCompleted.length
    : 0;

  // Statistiques par jour pour les graphiques (30 derniers jours)
  const dailyStats = {};
  const weeklyStats = {};
  const monthlyStats = {};
  
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  allCompleted.forEach(task => {
    if (!task.completedAt) return;
    const completedDate = new Date(task.completedAt);
    
    // Par jour (30 derniers jours)
    if (completedDate >= thirtyDaysAgo) {
      const date = completedDate.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { date, amount: 0, count: 0 };
      }
      dailyStats[date].amount += task.amount || 0;
      dailyStats[date].count += 1;
    }

    // Par semaine (12 dernières semaines)
    const weekStart = new Date(completedDate);
    weekStart.setDate(completedDate.getDate() - completedDate.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = { date: weekKey, amount: 0, count: 0 };
    }
    weeklyStats[weekKey].amount += task.amount || 0;
    weeklyStats[weekKey].count += 1;

    // Par mois (12 derniers mois)
    const monthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = { date: monthKey, amount: 0, count: 0 };
    }
    monthlyStats[monthKey].amount += task.amount || 0;
    monthlyStats[monthKey].count += 1;
  });

  // Calculer la progression
  const monthProgress = earnedLastMonth > 0 
    ? ((earnedThisMonth - earnedLastMonth) / earnedLastMonth) * 100 
    : 0;

  return {
    earnedThisMonth,
    earnedLastMonth,
    earnedThisWeek,
    pendingAmount,
    totalEarned,
    projectedEndOfMonth: earnedThisMonth + pendingAmount,
    completedThisMonth: completedThisMonth.length,
    completedLastMonth: completedLastMonth.length,
    completedThisWeek: completedThisWeek.length,
    pendingTasks: pendingTasks.length,
    totalTasks: allTasks.length,
    totalCompleted: allCompleted.length,
    averageTaskAmount: avgAmount,
    averageCompletedAmount: avgCompletedAmount,
    monthProgress,
    dailyStats: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
    weeklyStats: Object.values(weeklyStats).sort((a, b) => a.date.localeCompare(b.date)).slice(-12),
    monthlyStats: Object.values(monthlyStats).sort((a, b) => a.date.localeCompare(b.date)).slice(-12),
  };
}

