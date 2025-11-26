
package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Category;
import com.QuitQ.QuitQBackend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepo;

    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    @Override
    public Category create(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("Category name is required");
        }
        if (categoryRepo.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category already exists");
        }
        return categoryRepo.save(category);
    }

    @Override
    public Category update(Long id, Category category) {
        Category existing = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (category.getName() != null && !category.getName().isBlank()) existing.setName(category.getName());
        if (category.getDescription() != null) existing.setDescription(category.getDescription());
        return categoryRepo.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!categoryRepo.existsById(id)) throw new RuntimeException("Category not found");
        categoryRepo.deleteById(id);
    }

    @Override
    public Category getById(Long id) {
        return categoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Override
    public List<Category> listAll() {
        return categoryRepo.findAll();
    }

    @Override
    public Page<Category> listAll(Pageable pageable) {
        return categoryRepo.findAll(pageable);
    }
    @Override
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }
}
