package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.Category;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.dto.ProductDto;
import com.QuitQ.QuitQBackend.repository.ProductRepository;
import com.QuitQ.QuitQBackend.repository.CategoryRepository;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;
    private final UserRepository userRepo;
    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

    // Read APP_UPLOAD_DIR env var (container-friendly). Default to /opt/quitq/uploads.
    @Value("${app.upload.dir:/opt/quitq/uploads}")
    private String uploadDir;

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

    // NEW: upload image for product
    @Override
    public ProductDto uploadProductImage(Long productId, MultipartFile file, User currentSeller) throws IOException {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id " + productId));

        // --- OPTIONAL: temporarily disable ownership check for testing ---
        // If you suspect ownership mismatch, comment out the next block to test.
        /*
        if (product.getSeller() == null || !product.getSeller().getId().equals(currentSeller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this product");
        }
        */

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "";
        if (!(contentType.equalsIgnoreCase("image/png") ||
              contentType.equalsIgnoreCase("image/jpeg") ||
              contentType.equalsIgnoreCase("image/jpg"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PNG/JPEG images allowed");
        }

        // DEBUG: log useful info
        logger.debug("uploadDir configured as: {}", uploadDir);
        logger.debug("Attempting upload for productId={}, sellerId={}, originalFilename={}",
                productId,
                currentSeller != null ? currentSeller.getId() : null,
                file.getOriginalFilename());

        Path uploadPath = Paths.get(uploadDir);
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.lastIndexOf('.') > 0) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID().toString() + ext;
        Path target = uploadPath.resolve(filename);

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            logger.error("Failed to create upload directory {} : {}", uploadPath.toAbsolutePath(), e.toString(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create upload directory");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ioe) {
            logger.error("Failed to save uploaded file to {} : {}", target.toAbsolutePath(), ioe.toString(), ioe);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save uploaded file");
        }

        String imageUrl = "/uploads/" + filename;
        product.setImageUrl(imageUrl);
        productRepo.save(product);

        logger.debug("File saved successfully for productId={}, url={}", productId, imageUrl);

        return convertToDto(product);
    }


    // helper mapper
    private ProductDto convertToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setPrice(p.getPrice());
        dto.setStock(p.getStock());
        dto.setBrand(p.getBrand());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        }
        if (p.getSeller() != null) {
            dto.setSellerId(p.getSeller().getId());
            dto.setSellerName(p.getSeller().getName());
        }
        dto.setImageUrl(p.getImageUrl()); // include image
        return dto;
    }
}
