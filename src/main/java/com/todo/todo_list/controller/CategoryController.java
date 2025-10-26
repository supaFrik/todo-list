package com.todo.todo_list.controller;

import com.todo.todo_list.entity.Category;
import com.todo.todo_list.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Category> getCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public Category addCategory(@RequestBody Category category) {
        if (category == null || category.getName() == null || category.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }

        return categoryService.createCategory(category.getName());
    }
}
