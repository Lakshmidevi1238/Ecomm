
package com.QuitQ.QuitQBackend.controller;

import com.QuitQ.QuitQBackend.dto.CategoryDto;
import com.QuitQ.QuitQBackend.dto.CategoryRequest;
import com.QuitQ.QuitQBackend.model.Category;
import com.QuitQ.QuitQBackend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> listAll() {
        List<CategoryDto> categories = categoryService.listAll()
                .stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getDescription()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    
    @GetMapping("/categories/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") Long id) {
        try {
            Category c = categoryService.getById(id);
            CategoryDto dto = new CategoryDto(c.getId(), c.getName(), c.getDescription());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Category not found"));
        }
    }

    
    @PostMapping("/admin/categories")
    public ResponseEntity<?> create(@Valid @RequestBody CategoryRequest req) {
        try {
            Category c = new Category(req.getName(), req.getDescription());
            Category created = categoryService.create(c);
            CategoryDto dto = new CategoryDto(created.getId(), created.getName(), created.getDescription());
            return ResponseEntity.status(201).body(dto);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage()));
        }
    }

   
    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id,
                                    @Valid @RequestBody CategoryRequest req) {
        try {
            Category toUpdate = new Category();
            toUpdate.setName(req.getName());
            toUpdate.setDescription(req.getDescription());
            Category updated = categoryService.update(id, toUpdate);
            CategoryDto dto = new CategoryDto(updated.getId(), updated.getName(), updated.getDescription());
            return ResponseEntity.ok(dto);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Category not found"));
        }
    }

   
    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        try {
            Category c = categoryService.getById(id);
            if (c.getProducts() != null && !c.getProducts().isEmpty()) {
                return ResponseEntity.status(400)
                        .body(java.util.Map.of("message", "Category has products; reassign or remove products before deleting"));
            }
            categoryService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", "Category not found"));
        }
    }
    @GetMapping("/seller/all")
    public ResponseEntity<List<CategoryDto>> getAllCategoriesForSeller() {
        List<CategoryDto> categories = categoryService.getAllCategories()
                .stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getDescription()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

}
