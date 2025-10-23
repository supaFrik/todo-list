// Moved from inline <script> in index.html
let tasks = [];
let currentFilter = 'all';

const taskForm = document.getElementById('taskForm');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const tagsInput = document.getElementById('tagsInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');

// Set default date to today
const today = new Date().toISOString().split('T')[0];
dueDateInput.value = today;

// Category colors
const categoryColors = {
    work: 'bg-green-100 text-green-800',
    education: 'bg-blue-100 text-blue-800',
    research: 'bg-purple-100 text-purple-800',
    meeting: 'bg-yellow-100 text-yellow-800',
    personal: 'bg-pink-100 text-pink-800'
};

// Add task
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const tags = tagsInput.value.trim()
        ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

    const task = {
        id: Date.now(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        category: categorySelect.value,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value,
        tags: tags,
        completed: false,
        createdAt: new Date()
    };

    tasks.unshift(task);
    titleInput.value = '';
    descriptionInput.value = '';
    tagsInput.value = '';
    dueDateInput.value = today;
    renderTasks();
});

// Render tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    taskList.innerHTML = filteredTasks.map(task => {
        const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : '';

        const tagsHtml = task.tags && task.tags.length > 0
            ? `<div class="flex gap-1 flex-wrap">${task.tags.map(tag =>
                `<span class="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-full">${tag}</span>`
              ).join('')}</div>`
            : '';

        return `
        <div class="task-item p-4 border border-gray-100 rounded-md priority-${task.priority} fade-in ${task.completed ? 'completed' : ''}" data-id="${task.id}" data-category="${task.category}" data-completed="${task.completed}">
            <div class="flex items-start gap-3">
                <input type="checkbox" aria-label="Mark task complete" class="task-checkbox mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" ${task.completed ? 'checked' : ''}>
                <div class="flex-1">
                    <div class="task-text text-gray-800 font-semibold">${task.title}</div>
                    ${task.description ? `<div class="text-sm text-gray-600 mt-1">${task.description}</div>` : ''}
                    <div class="flex items-center gap-2 mt-2 flex-wrap">
                        <span class="text-xs px-2 py-1 ${categoryColors[task.category]} rounded-full capitalize">${task.category}</span>
                        <span class="text-xs text-gray-500 capitalize">${task.priority} Priority</span>
                        ${formattedDate ? `<span class="text-xs text-gray-500">Due: ${formattedDate}</span>` : ''}
                        ${tagsHtml}
                    </div>
                </div>
                <button class="delete-btn text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTask);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });
}

// Toggle task completion
function toggleTask(e) {
    const taskId = parseInt(e.target.closest('.task-item').dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = e.target.checked;
        renderTasks();
    }
}

// Delete task
function deleteTask(e) {
    const taskId = parseInt(e.target.closest('.task-item').dataset.id);
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
}

// Filter tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Filter button handlers
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active', 'bg-blue-100', 'text-blue-800'));
        this.classList.add('active', 'bg-blue-100', 'text-blue-800');

        currentFilter = this.id.replace('filter', '').toLowerCase();
        renderTasks();
    });
});

renderTasks();
