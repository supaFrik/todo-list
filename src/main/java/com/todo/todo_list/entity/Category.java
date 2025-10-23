package com.todo.todo_list.entity;

import com.todo.todo_list.entity.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "category")
public class Category extends BaseEntity {
    @NotBlank @Size(min = 1, max = 100)
    private String name;

    public Category() {
        super();
    }

    public Category(String name) {
        this.name = name;
    }

    public Category(Long id, LocalDateTime createDate, LocalDateTime updateDate, String status, String name) {
        super(id, createDate, updateDate);
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
