package com.todo.todo_list.service;

import com.todo.todo_list.entity.Category;
import com.todo.todo_list.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    private String normalizeName(String raw) {
        if (raw == null) return null;
        String t = raw.trim();
        if (t.isEmpty()) return t;
        if (t.length() == 1) return t.substring(0,1).toUpperCase();
        return t.substring(0,1).toUpperCase() + t.substring(1).toLowerCase();
    }

    @Transactional
    public Category createCategory(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        String trimmed = name.trim();
        if (categoryRepository.findByNameIgnoreCase(trimmed).isPresent() || categoryRepository.findByName(trimmed).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }
        Category c = new Category(normalizeName(trimmed));
        return categoryRepository.save(c);
    }

    public Category resolveCategoryByName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        String trimmed = name.trim();
        Optional<Category> found = categoryRepository.findByName(trimmed);
        if (found.isEmpty()) found = categoryRepository.findByNameIgnoreCase(trimmed);
        return found.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found!"));
    }
}
