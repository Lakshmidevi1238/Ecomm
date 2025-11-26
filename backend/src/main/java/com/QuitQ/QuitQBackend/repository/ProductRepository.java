package com.QuitQ.QuitQBackend.repository;

import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.Category;
import com.QuitQ.QuitQBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    
    List<Product> findAllByActiveTrue();

    List<Product> findByCategoryAndActiveTrue(Category category);

    List<Product> findBySellerAndActiveTrue(User seller);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);

  
    List<Product> findBySeller(User seller);
}
