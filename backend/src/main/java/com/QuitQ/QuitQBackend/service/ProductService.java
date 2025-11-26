package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.dto.ProductDto;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.io.IOException;

public interface ProductService {
    Product create(Product product);
    Product update(Long id, Product product);
    void delete(Long id);
    Product getById(Long id);

    List<Product> listAll();

    // NEW: upload image for a product (throws IOException)
    ProductDto uploadProductImage(Long productId, MultipartFile file, User currentSeller) throws IOException;
}
