package com.todo.todo_list.service;

import com.todo.todo_list.entity.Category;
import com.todo.todo_list.entity.Task;
import com.todo.todo_list.entity.enums.Status;
import com.todo.todo_list.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final CategoryService categoryService;

    public TaskService(TaskRepository taskRepository, CategoryService categoryService) {
        this.taskRepository = taskRepository;
        this.categoryService = categoryService;
    }

    @Transactional
    public Task createTaskFromParams(String title, String description, String categoryName, Status status, LocalDateTime dueDate) {
        Category category = categoryService.resolveCategoryByName(categoryName);
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setCategory(category);
        task.setDueDate(dueDate);
        task.setStatus(status);

        return taskRepository.save(task);
    }

    public Task updateTaskFromParams(Long id, String title, String description, String categoryName, Status status, LocalDateTime dueDate) {
        Category category = categoryService.resolveCategoryByName(categoryName);

        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found!"));
        existingTask.setTitle(title);
        existingTask.setDescription(description);
        existingTask.setCategory(category);
        existingTask.setDueDate(dueDate);
        existingTask.setStatus(status);

        return taskRepository.save(existingTask);
    }

    @Transactional(readOnly = true)
    public List<Task> getTaskByCategory(String name) {
        Category category = categoryService.resolveCategoryByName(name);
        return taskRepository.findAllByCategory(category);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found!"));

        if (existingTask.getStatus() == Status.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete completed task!");
        }

        taskRepository.delete(existingTask);
    }
}
