document.addEventListener('DOMContentLoaded', function() {
    // Các elements
    const todoForm = document.getElementById('todo-form');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const refreshBtn = document.getElementById('refresh-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Modals
    const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));
    
    // Form elements
    const editForm = document.getElementById('edit-form');
    const editId = document.getElementById('edit-id');
    const editTitle = document.getElementById('edit-title');
    const editDescription = document.getElementById('edit-description');
    const editCompleted = document.getElementById('edit-completed');
    const saveEditBtn = document.getElementById('save-edit');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const deleteTitle = document.getElementById('delete-title');
    
    // Khởi tạo
    fetchTodos();
    
    // Thêm todo mới
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        
        createTodo(title, description);
        todoForm.reset();
    });
    
    // Refresh danh sách
    refreshBtn.addEventListener('click', fetchTodos);
    
    // Lưu chỉnh sửa
    saveEditBtn.addEventListener('click', function() {
        const id = editId.value;
        const title = editTitle.value;
        const description = editDescription.value;
        const completed = editCompleted.checked;
        
        updateTodo(id, title, description, completed);
        editModal.hide();
    });
    
    // Xác nhận xóa
    let todoToDelete = null;
    confirmDeleteBtn.addEventListener('click', function() {
        if (todoToDelete) {
            deleteTodo(todoToDelete);
            todoToDelete = null;
            deleteModal.hide();
        }
    });
    
    // Lấy danh sách todos
    function fetchTodos() {
        showLoading(true);
        
        fetch(`${API_ENDPOINT}/todos`)
            .then(response => response.json())
            .then(todos => {
                renderTodos(todos);
                showLoading(false);
            })
            .catch(error => {
                console.error('Error fetching todos:', error);
                showLoading(false);
                alert('Có lỗi xảy ra khi tải danh sách công việc.');
            });
    }
    
    // Tạo todo mới
    function createTodo(title, description) {
        showLoading(true);
        
        fetch(`${API_ENDPOINT}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description
            }),
        })
            .then(response => response.json())
            .then(newTodo => {
                fetchTodos();
            })
            .catch(error => {
                console.error('Error creating todo:', error);
                showLoading(false);
                alert('Có lỗi xảy ra khi thêm công việc mới.');
            });
    }
    
    // Cập nhật todo
    function updateTodo(id, title, description, completed) {
        showLoading(true);
        
        fetch(`${API_ENDPOINT}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                completed
            }),
        })
            .then(response => response.json())
            .then(updatedTodo => {
                fetchTodos();
            })
            .catch(error => {
                console.error('Error updating todo:', error);
                showLoading(false);
                alert('Có lỗi xảy ra khi cập nhật công việc.');
            });
    }
    
    // Xóa todo
    function deleteTodo(id) {
        showLoading(true);
        
        fetch(`${API_ENDPOINT}/todos/${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(result => {
                fetchTodos();
            })
            .catch(error => {
                console.error('Error deleting todo:', error);
                showLoading(false);
                alert('Có lỗi xảy ra khi xóa công việc.');
            });
    }
    
    // Hiển thị danh sách todos
    function renderTodos(todos) {
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');
        
        // Sắp xếp theo thời gian tạo mới nhất
        todos.sort((a, b) => b.createdAt - a.createdAt);
        
        todos.forEach(todo => {
            const item = document.createElement('div');
            item.className = `list-group-item ${todo.completed ? 'todo-completed' : ''}`;
            
            const formattedDate = new Date(todo.updatedAt).toLocaleString('vi-VN');
            
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="todo-title">${escapeHtml(todo.title)}</h5>
                        <p class="todo-description mb-1">${escapeHtml(todo.description || 'Không có mô tả.')}</p>
                        <div class="d-flex align-items-center">
                            <span class="todo-status ${todo.completed ? 'status-completed' : 'status-pending'} me-2">
                                ${todo.completed ? 'Đã hoàn thành' : 'Đang thực hiện'}
                            </span>
                            <span class="todo-date">
                                Cập nhật: ${formattedDate}
                            </span>
                        </div>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${todo.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${todo.id}" data-title="${escapeHtml(todo.title)}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Thêm sự kiện cho nút chỉnh sửa
            const editBtn = item.querySelector('.edit-btn');
            editBtn.addEventListener('click', function() {
                fetchTodoForEdit(todo.id);
            });
            
            // Thêm sự kiện cho nút xóa
            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                todoToDelete = todo.id;
                deleteTitle.textContent = todo.title;
                deleteModal.show();
            });
            
            todoList.appendChild(item);
        });
    }
    
    // Lấy thông tin todo để chỉnh sửa
    function fetchTodoForEdit(id) {
        showLoading(true);
        
        fetch(`${API_ENDPOINT}/todos/${id}`)
            .then(response => response.json())
            .then(todo => {
                editId.value = todo.id;
                editTitle.value = todo.title;
                editDescription.value = todo.description || '';
                editCompleted.checked = todo.completed;
                
                editModal.show();
                showLoading(false);
            })
            .catch(error => {
                console.error('Error fetching todo for edit:', error);
                showLoading(false);
                alert('Có lỗi xảy ra khi tải thông tin công việc.');
            });
    }
    
    // Hiển thị/ẩn trạng thái loading
    function showLoading(show) {
        if (show) {
            loadingIndicator.classList.remove('d-none');
        } else {
            loadingIndicator.classList.add('d-none');
        }
    }
    
    // Hàm escape HTML để tránh XSS
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});