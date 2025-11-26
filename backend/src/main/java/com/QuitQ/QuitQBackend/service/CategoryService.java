// CategoryService.java
package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    Category create(Category category);
    Category update(Long id, Category category);
    void delete(Long id);
    Category getById(Long id);
    List<Category> listAll();
    Page<Category> listAll(Pageable pageable);
   
        List<Category> getAllCategories();
       
    

    
}

