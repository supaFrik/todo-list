// Moved from inline <script> in index.html and updated to call backend APIs
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

// Helper: map frontend priority string to backend enum name
function frontendPriorityToEnum(p) {
    if (!p) return 'MEDIUM';
    switch (p.toLowerCase()) {
        case 'high': return 'HIGH';
        case 'low': return 'LOW';
        default: return 'MEDIUM';
    }
}

function statusToCompleted(status) {
    if (!status) return false;
    return status.toUpperCase() === 'COMPLETED';
}

function isJsonResponse(res) {
    const ct = res.headers && res.headers.get ? (res.headers.get('content-type') || '') : '';
    return ct.includes('application/json') || ct.includes('+json');
}

async function loadCategories() {
    try {
        const res = await fetch('/api/categories', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
            const txt = await res.text();
            console.warn('Failed to load categories from server:', txt || res.statusText);
            disableAddTask('No categories available');
            return;
        }

        if (!isJsonResponse(res)) {
            console.warn('Categories endpoint did not return JSON; keeping placeholder');
            disableAddTask('No categories available');
            return;
        }

        const data = await res.json();
        categorySelect.innerHTML = '';
        data.forEach(c => {
            const opt = document.createElement('option');
            opt.value = (c.name || '').toLowerCase();
            opt.text = c.name || c;
            categorySelect.appendChild(opt);
        });

        if (categorySelect.options.length === 0) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.text = 'No categories yet — add one';
            categorySelect.appendChild(placeholder);
            disableAddTask('No categories available');
            return;
        }

        categorySelect.selectedIndex = 0;
        enableAddTask();
    } catch (err) {
        console.error('Error loading categories:', err);
        disableAddTask('No categories available');
    }
}

const addTaskBtn = document.querySelector('#taskForm button[type="submit"]');
function disableAddTask(title) {
    if (addTaskBtn) {
        addTaskBtn.disabled = true;
        if (title) addTaskBtn.title = title;
    }
}
function enableAddTask() {
    if (addTaskBtn) {
        addTaskBtn.disabled = false;
        addTaskBtn.title = '';
    }
}

disableAddTask('Loading categories...');

// Delete task
async function deleteTask(e) {
    const taskId = parseInt(e.target.closest('.task-item').dataset.id);
    if (!confirm('Delete this task?')) return;

    try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error('Failed to delete task: ' + txt);
        }
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
    } catch (err) {
        console.error(err);
        alert('Failed to delete task. See console for details.');
    }
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

filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active', 'bg-blue-100', 'text-blue-800'));
        this.classList.add('active', 'bg-blue-100', 'text-blue-800');

        currentFilter = this.id.replace('filter', '').toLowerCase();
        renderTasks();
    });
});

// Add category UI handling
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');

if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', async function () {
        const val = newCategoryInput.value ? newCategoryInput.value.trim() : '';
        if (!val) {
            alert('Please enter a category name');
            return;
        }

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ name: val })
            });

            if (res.status === 409) {
                alert('Category already exists');
                return;
            }

            if (!res.ok) {
                const txt = await res.text();
                throw new Error('Failed to add category: ' + (txt || res.statusText));
            }

            const created = await res.json();
            const display = created.name || val;
            const value = (display || val).toLowerCase();

            if (![...categorySelect.options].some(o => o.value.toLowerCase() === value)) {
                const opt = document.createElement('option');
                opt.value = value;
                opt.text = display;
                categorySelect.appendChild(opt);
            }

            categorySelect.value = value;
            newCategoryInput.value = '';

            enableAddTask();
        } catch (err) {
            console.error(err);
            alert('Error creating category. See console for details.');
        }
    });
}

taskForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Prevent submitting if no category chosen
    if (!categorySelect || !categorySelect.value) {
        alert('Please add and select a category before creating a task.');
        return;
    }

    const tags = tagsInput.value.trim()
        ? tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

    const payload = new URLSearchParams();
    payload.append('title', titleInput.value.trim());
    payload.append('description', descriptionInput.value.trim());
    payload.append('categoryName', categorySelect.value);
    payload.append('status', 'PENDING');
    payload.append('dueDate', dueDateInput.value ? new Date(dueDateInput.value).toISOString() : '');

    try {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: payload.toString()
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error('Failed to create task: ' + (txt || res.statusText));
        }

        if (!isJsonResponse(res)) {
            const txt = await res.text();
            console.error('Unexpected non-JSON response from POST /api/tasks:', txt);
            alert('Server returned an unexpected response when creating the task. Check the server logs.');
            return;
        }

        const created = await res.json();
        tasks.unshift({
            id: created.id,
            title: created.title,
            description: created.description,
            category: created.category ? created.category.name.toLowerCase() : categorySelect.value,
            priority: created.priority ? created.priority.toLowerCase() : prioritySelect.value,
            dueDate: created.dueDate ? created.dueDate : null,
            tags: created.tags || tags,
            completed: statusToCompleted(created.status),
            rawStatus: created.status
        });

        titleInput.value = '';
        descriptionInput.value = '';
        tagsInput.value = '';
        dueDateInput.value = today;
        renderTasks();
    } catch (err) {
        console.error(err);
        // If server returned 404 for category not found, show a clearer message
        if (err.message && err.message.includes('Category not found')) {
            alert('Category not found on server. Please add the category first.');
        } else {
            alert('Error creating task. See console for details.');
        }
    }
});

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
                    <div class="task-text text-gray-800 font-semibold">${escapeHtml(task.title)}</div>
                    ${task.description ? `<div class="text-sm text-gray-600 mt-1">${escapeHtml(task.description)}</div>` : ''}
                    <div class="flex items-center gap-2 mt-2 flex-wrap">
                        <span class="text-xs px-2 py-1 ${categoryColors[task.category] || 'bg-gray-50 text-gray-700'} rounded-full capitalize">${task.category}</span>
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

async function toggleTask(e) {
    const taskId = parseInt(e.target.closest('.task-item').dataset.id);
    const isCompleted = e.target.checked;
    const newStatus = isCompleted ? 'COMPLETED' : 'PENDING';

    try {
        const res = await fetch(`/api/tasks/${taskId}/status?status=${newStatus}`, { method: 'PATCH', headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error('Failed to update status: ' + (txt || res.statusText));
        }

        if (!isJsonResponse(res)) {
            const txt = await res.text();
            console.error('Unexpected non-JSON response from PATCH /api/tasks/:id/status', txt);
            throw new Error('Server returned non-JSON when updating task status');
        }

        const updated = await res.json();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = statusToCompleted(updated.status);
            task.rawStatus = updated.status;
            renderTasks();
        }
    } catch (err) {
        console.error(err);
        alert('Ooh. Got some error right here.');
        e.target.checked = !isCompleted;
    }
}

// Basic HTML escaping to prevent injection from backend
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, function (c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
}

// Initial load: load categories first, then tasks
(async function init() {
    await loadCategories();
    await loadTasks();
})();
