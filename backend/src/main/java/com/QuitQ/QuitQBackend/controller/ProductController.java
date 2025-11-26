package com.QuitQ.QuitQBackend.controller;

import com.QuitQ.QuitQBackend.dto.ProductDto;
import com.QuitQ.QuitQBackend.dto.ProductRequest;
import com.QuitQ.QuitQBackend.model.Category;
import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.repository.ProductRepository;
import com.QuitQ.QuitQBackend.service.ProductService;
import com.QuitQ.QuitQBackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final UserService userService;

    @Autowired
    public ProductController(ProductService productService,
                             ProductRepository productRepository,
                             UserService userService) {
        this.productService = productService;
        this.productRepository = productRepository;
        this.userService = userService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> listProducts() {
        List<ProductDto> dtos = productService.listAll()
                .stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }


    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        try {
            Product p = productService.getById(id);
            return ResponseEntity.ok(toDto(p));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("message", "Product not found"));
        }
    }

    @PostMapping("/seller/products")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest.CreateProductRequest req,
                                           Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body("Unauthorized");
        User seller = userService.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getName() == null || req.getName().isBlank()) return ResponseEntity.badRequest().body(Map.of("message","name required"));
        if (req.getPrice() == null) return ResponseEntity.badRequest().body(Map.of("message","price required"));

        Product p = new Product();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setStock(req.getStock() == null ? 0 : req.getStock());
        p.setBrand(req.getBrand());
        p.setSeller(seller);
        if (req.getCategoryId() != null) { Category c = new Category(); c.setId(req.getCategoryId()); p.setCategory(c); }

        Product saved = productService.create(p);
        return ResponseEntity.status(201).body(toDto(saved));
    }

    // NEW: upload image for a seller product
    @PostMapping("/seller/products/{id}/image")
    public ResponseEntity<?> uploadProductImage(@PathVariable("id") Long id,
                                                @RequestParam("file") MultipartFile file,
                                                Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body("Unauthorized");
        User seller = userService.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        try {
            ProductDto dto = productService.uploadProductImage(id, file, seller);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException | java.io.IOException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/seller/products")
    public ResponseEntity<?> listSellerProducts(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        User seller = userService.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Product> products = productRepository.findBySeller(seller);

        List<ProductDto> dtos = products.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/seller/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @RequestBody ProductRequest.UpdateProductRequest req,
                                           Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body("Unauthorized");
        User u = userService.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));

        Product existing;
        try { existing = productService.getById(id); }
        catch (RuntimeException ex) { return ResponseEntity.status(404).body(Map.of("message","Product not found")); }

        boolean isOwner = existing.getSeller() != null && existing.getSeller().getId() != null && existing.getSeller().getId().equals(u.getId());
        boolean isAdmin = u.getRole() != null && "ROLE_ADMIN".equals(u.getRole().name());
        if (!isOwner && !isAdmin) return ResponseEntity.status(403).body(Map.of("message","Forbidden"));

        if (req.getName() != null) existing.setName(req.getName());
        if (req.getDescription() != null) existing.setDescription(req.getDescription());
        if (req.getPrice() != null) existing.setPrice(req.getPrice());
        if (req.getStock() != null) existing.setStock(req.getStock());
        if (req.getBrand() != null) existing.setBrand(req.getBrand());
        if (req.getCategoryId() != null) { Category c = new Category(); c.setId(req.getCategoryId()); existing.setCategory(c); }

        Product saved = productService.update(id, existing);
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/seller/products/{id}")
    public ResponseEntity<?> deleteProductBySeller(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body("Unauthorized");
        User u = userService.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));

        Product existing;
        try { existing = productService.getById(id); }
        catch (RuntimeException ex) { return ResponseEntity.status(404).body(Map.of("message","Product not found")); }

        boolean isOwner = existing.getSeller() != null && existing.getSeller().getId() != null && existing.getSeller().getId().equals(u.getId());
        boolean isAdmin = u.getRole() != null && "ROLE_ADMIN".equals(u.getRole().name());
        if (!isOwner && !isAdmin) return ResponseEntity.status(403).body(Map.of("message","Forbidden"));

        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<?> deleteProductByAdmin(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body("Unauthorized");
        User u = userService.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        if (u.getRole() == null || !"ROLE_ADMIN".equals(u.getRole().name())) return ResponseEntity.status(403).body(Map.of("message","Forbidden"));
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private ProductDto toDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        dto.setBrand(p.getBrand());
        if (p.getCategory() != null) { dto.setCategoryId(p.getCategory().getId()); dto.setCategoryName(p.getCategory().getName()); }
        if (p.getSeller() != null) { dto.setSellerId(p.getSeller().getId()); dto.setSellerName(p.getSeller().getName()); }
        dto.setImageUrl(p.getImageUrl()); // <-- include image url in DTO
        return dto;
    }
}
