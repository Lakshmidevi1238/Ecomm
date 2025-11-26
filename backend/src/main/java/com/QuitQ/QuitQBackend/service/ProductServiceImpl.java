package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.Category;
import com.QuitQ.QuitQBackend.repository.ProductRepository;
import com.QuitQ.QuitQBackend.repository.CategoryRepository;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final UserRepository userRepo;

    @Autowired
    public ProductServiceImpl(ProductRepository productRepo,
                              CategoryRepository categoryRepo,
                              UserRepository userRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.userRepo = userRepo;
    }

    @Override
    public Product create(Product product) {
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category cat = categoryRepo.findById(product.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(cat);
        }
        product.setActive(true);
        return productRepo.save(product);
    }

    @Override
    public Product update(Long id, Product product) {
        Product p = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (product.getName() != null) p.setName(product.getName());
        if (product.getDescription() != null) p.setDescription(product.getDescription());
        if (product.getPrice() != null) p.setPrice(product.getPrice());
        if (product.getStock() != null) p.setStock(product.getStock());
        if (product.getBrand() != null) p.setBrand(product.getBrand());
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category cat = categoryRepo.findById(product.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            p.setCategory(cat);
        }
        return productRepo.save(p);
    }

    @Override
    public void delete(Long id) {
        productRepo.deleteById(id);
    }

    @Override
    public Product getById(Long id) {
        Product p = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (!p.isActive()) throw new RuntimeException("Product not available");
        return p;
    }

    @Override
    public List<Product> listAll() {
        return productRepo.findAll()
                .stream()
                .filter(Product::isActive)
                .toList();
    }

    
}
