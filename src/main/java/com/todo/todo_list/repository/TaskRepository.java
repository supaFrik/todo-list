package com.todo.todo_list.repository;

import com.todo.todo_list.entity.Category;
import com.todo.todo_list.entity.Task;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task,Long> {
    @EntityGraph
    List<Task> findAllByCategory(Category category);

    @EntityGraph
    List<Task> findAllByCategory(Category category, Pageable pageable);

    @EntityGraph
    List<Task> findAllByCategoryAndStatus(Category category, String status, Pageable pageable);

    Optional<Task> findByTitle(String title);

    Optional<Task> findById(Long id);

    Optional<Task> findByIdAndCategory(Long id, Category category);
}

