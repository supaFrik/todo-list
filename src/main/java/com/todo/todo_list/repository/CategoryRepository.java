package com.todo.todo_list.repository;

import com.todo.todo_list.entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category,Long> {
    @EntityGraph
    Optional<Category> findById(long id);

    @EntityGraph
    Optional<Category> findByName(String name);
}
