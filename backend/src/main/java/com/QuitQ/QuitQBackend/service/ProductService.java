package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    Product create(Product product);
    Product update(Long id, Product product);
    void delete(Long id);
    Product getById(Long id);
    

    List<Product> listAll();
}
