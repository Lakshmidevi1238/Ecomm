
package com.QuitQ.QuitQBackend.repository;

import com.QuitQ.QuitQBackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    boolean existsByName(String name);
}
