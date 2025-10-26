package com.todo.todo_list.controller;

import com.todo.todo_list.entity.Task;
import com.todo.todo_list.entity.enums.Status;
import com.todo.todo_list.repository.TaskRepository;
import com.todo.todo_list.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final TaskService taskService;

    public TaskController(TaskRepository taskRepository, TaskService taskService) {
        this.taskRepository = taskRepository;
        this.taskService = taskService;
    }

    private LocalDateTime parseDueDate(String dueDateStr) {
        if (dueDateStr == null || dueDateStr.isBlank()) return null;
        try {
            Instant instant = Instant.parse(dueDateStr);
            return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDateTime.parse(dueDateStr);
            } catch (DateTimeParseException ex) {
                return null;
            }
        }
    }

    @PostMapping
    public Task createTask(@RequestParam String title,
                           @RequestParam String description,
                           @RequestParam String categoryName,
                           @RequestParam Status status,
                           @RequestParam(required = false) String dueDate) {
        LocalDateTime parsed = parseDueDate(dueDate);
        return taskService.createTaskFromParams(title, description, categoryName, status, parsed);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id,
            @RequestParam String title,
                           @RequestParam String description,
                           @RequestParam String categoryName,
                           @RequestParam Status status,
                           @RequestParam(required = false) String dueDate) {
        LocalDateTime parsed = parseDueDate(dueDate);
        return taskService.updateTaskFromParams(id, title, description, categoryName, status, parsed);
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteTaskById(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @PatchMapping("/{id}/status")
    public Task updateTaskStatus(@PathVariable Long id, @RequestParam Status status) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        task.setStatus(status);
        taskRepository.save(task);
        return task;
    }

    @GetMapping("/category/{name}")
    public List<Task> getTasksByCategory(@PathVariable String name) {
        return taskService.getTaskByCategory(name);
    }
}
