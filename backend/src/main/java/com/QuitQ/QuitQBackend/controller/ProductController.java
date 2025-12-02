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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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

    // Upload image for a seller product.
    // NOTE: the service stores imageUrl as "/uploads/{filename}" — frontend should use /uploads/{filename} (public static path),
    // not /api/v1/seller/products/{id}/image (that path is secured to sellers).
    @PostMapping("/seller/products/{id}/image")
    public ResponseEntity<?> uploadProductImage(@PathVariable("id") Long id,
                                                @RequestParam("file") MultipartFile file,
                                                Authentication auth,
                                                UriComponentsBuilder uriBuilder) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).body("Unauthorized");
        User seller = userService.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        try {
            ProductDto dto = productService.uploadProductImage(id, file, seller);
            // build location header to the public URL (imageUrl is like "/uploads/{filename}")
            URI location = uriBuilder.path(dto.getImageUrl()).build().toUri();
            return ResponseEntity.created(location).body(dto);
        } catch (ResponseStatusException rse) {
            // service used ResponseStatusException for controlled errors
            return ResponseEntity.status(rse.getStatusCode()).body(Map.of("message", rse.getReason()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", ex.getMessage()));
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
    @GetMapping("/seller/products/{id}/image")
    public ResponseEntity<?> getProductImageById(@PathVariable("id") Long id) {
        // find product
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Product not found"));
        }
        Product p = opt.get();
        String imageUrl = p.getImageUrl(); // expected like "/uploads/<filename>" or full URL

        // If product has no imageUrl, return 404
        if (imageUrl == null || imageUrl.isBlank()) {
            return ResponseEntity.status(404).body(Map.of("message", "Image not found"));
        }

        // If imageUrl is an absolute URL, redirect to it
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.LOCATION, imageUrl);
            return ResponseEntity.status(302).headers(headers).build();
        }

        // Normalize path: if imageUrl starts with "/uploads/", map to upload dir
        String uploadsPath = System.getenv().getOrDefault("APP_UPLOAD_DIR", "/opt/quitq/uploads");
        String expectedPrefix = "/uploads/";
        String filename = imageUrl;
        if (imageUrl.startsWith(expectedPrefix)) {
            filename = imageUrl.substring(expectedPrefix.length());
        } else if (imageUrl.startsWith("/")) {
            // strip leading slash
            filename = imageUrl.substring(1);
        }

        Path file = Paths.get(uploadsPath).resolve(filename).normalize();
        if (!Files.exists(file) || !Files.isReadable(file)) {
            return ResponseEntity.status(404).body(Map.of("message", "Image file not found"));
        }

        try {
            Resource resource = new UrlResource(file.toUri());
            // determine content type
            String contentType = Files.probeContentType(file);
            if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFileName().toString() + "\"")
                    .body(resource);
        } catch (MalformedURLException ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to read image"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Unexpected error"));
        }
    }

}
