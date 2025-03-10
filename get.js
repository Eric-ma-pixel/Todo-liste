// Détection du mode sombre
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    if (event.matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
});

// Logique de l'application TODO
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');
    const addBtn = document.getElementById('add-btn');
    const updateBtn = document.getElementById('update-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const taskIdInput = document.getElementById('task-id');
    const loadingSpinner = document.getElementById('loading-spinner');
    const notification = document.getElementById('notification');
    
    // URL de base pour les scripts PHP (à modifier selon votre configuration)
    const BASE_URL = 'http://localhost/todo_api/';

    // Fonction pour afficher une notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Fonction pour afficher/masquer le spinner de chargement
    function toggleLoading(show) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }

    // Formatage de la date pour l'affichage (YYYY-MM-DD → DD/MM/YYYY)
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    // Récupérer toutes les tâches depuis la base de données
    async function fetchTasks() {
        toggleLoading(true);
        try {
            const response = await fetch(`${BASE_URL}get_tasks.php`);
            if (!response.ok) {
                throw new Error('Erreur réseau ou serveur');
            }
            const data = await response.json();
            renderTasks(data);
        } catch (error) {
            showNotification('Erreur lors de la récupération des tâches: ' + error.message, 'error');
            console.error('Erreur:', error);
        } finally {
            toggleLoading(false);
        }
    }

    // Afficher les tâches dans le tableau
    function renderTasks(tasks) {
        todoList.innerHTML = '';
        if (tasks.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" style="text-align: center;">Aucune tâche disponible</td>';
            todoList.appendChild(tr);
            return;
        }

        tasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description || ''}</td>
                <td>${formatDate(task.date)}</td>
                <td class="actions">
                    <button class="btn-primary btn-action edit" data-id="${task.id}">Éditer</button>
                    <button class="btn-danger btn-action delete" data-id="${task.id}">Supprimer</button>
                </td>
            `;
            todoList.appendChild(tr);
        });

        // Ajouter les écouteurs d'événements pour les boutons
        document.querySelectorAll('.edit').forEach(btn => {
            btn.addEventListener('click', editTask);
        });
        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }

    // Ajouter une nouvelle tâche
    async function addTask(taskData) {
        toggleLoading(true);
        try {
            const response = await fetch(`${BASE_URL}add_task.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout de la tâche');
            }
            
            const result = await response.json();
            if (result.status === 'success') {
                showNotification('Tâche ajoutée avec succès!');
                fetchTasks(); // Rafraîchir la liste
                form.reset();
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }
        } catch (error) {
            showNotification('Erreur: ' + error.message, 'error');
            console.error('Erreur:', error);
        } finally {
            toggleLoading(false);
        }
    }

    // Mettre à jour une tâche existante
    async function updateTask(taskId, taskData) {
        toggleLoading(true);
        try {
            const response = await fetch(`${BASE_URL}update_task.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: taskId,
                    ...taskData
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de la tâche');
            }
            
            const result = await response.json();
            if (result.status === 'success') {
                showNotification('Tâche mise à jour avec succès!');
                fetchTasks(); // Rafraîchir la liste
                form.reset();
                resetForm();
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }
        } catch (error) {
            showNotification('Erreur: ' + error.message, 'error');
            console.error('Erreur:', error);
        } finally {
            toggleLoading(false);
        }
    }

    // Supprimer une tâche
    async function deleteTaskFromDB(taskId) {
        toggleLoading(true);
        try {
            const response = await fetch(`${BASE_URL}delete_task.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: taskId })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression de la tâche');
            }
            
            const result = await response.json();
            if (result.status === 'success') {
                showNotification('Tâche supprimée avec succès!');
                fetchTasks(); // Rafraîchir la liste
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }
        } catch (error) {
            showNotification('Erreur: ' + error.message, 'error');
            console.error('Erreur:', error);
        } finally {
            toggleLoading(false);
        }
    }

    // Handler pour la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        const taskId = taskIdInput.value;

        const taskData = {
            title,
            description,
            date
        };

        if (taskId) {
            // Mode édition
            updateTask(taskId, taskData);
        } else {
            // Mode ajout
            addTask(taskData);
        }
    });

    // Handler pour le bouton de mise à jour
    updateBtn.addEventListener('click', function() {
        form.dispatchEvent(new Event('submit'));
    });

    // Handler pour le bouton d'annulation
    cancelBtn.addEventListener('click', function() {
        resetForm();
    });

    // Fonction pour éditer une tâche
    async function editTask(e) {
        const taskId = e.target.dataset.id;
        toggleLoading(true);
        
        try {
            const response = await fetch(`${BASE_URL}get_task.php?id=${taskId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des détails de la tâche');
            }
            
            const task = await response.json();
            if (task) {
                // Remplir le formulaire avec les données de la tâche
                document.getElementById('title').value = task.title;
                document.getElementById('description').value = task.description || '';
                document.getElementById('date').value = task.date;
                taskIdInput.value = task.id;
                
                // Afficher le bouton de mise à jour et masquer le bouton d'ajout
                addBtn.style.display = 'none';
                updateBtn.style.display = 'block';
            }
        } catch (error) {
            showNotification('Erreur: ' + error.message, 'error');
            console.error('Erreur:', error);
        } finally {
            toggleLoading(false);
        }
    }

    // Fonction pour supprimer une tâche
    function deleteTask(e) {
        const taskId = e.target.dataset.id;
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            deleteTaskFromDB(taskId);
        }
    }

    // Fonction pour réinitialiser le formulaire (mode ajout)
    function resetForm() {
        form.reset();
        taskIdInput.value = '';
        addBtn.style.display = 'block';
        updateBtn.style.display = 'none';
    }

    // Initialisation : charger les tâches au démarrage
    fetchTasks();
});