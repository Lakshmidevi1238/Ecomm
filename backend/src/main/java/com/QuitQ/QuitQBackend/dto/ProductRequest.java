package com.QuitQ.QuitQBackend.dto;

import java.math.BigDecimal;

// All product request DTOs grouped in one file
public class ProductRequest {

    // For creating a new product
    public static class CreateProductRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private String brand;
        private Long categoryId;

        public CreateProductRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }

        public String getBrand() { return brand; }
        public void setBrand(String brand) { this.brand = brand; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    }

    // For updating an existing product
    public static class UpdateProductRequest {
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private String brand;
        private Long categoryId;

        public UpdateProductRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }

        public String getBrand() { return brand; }
        public void setBrand(String brand) { this.brand = brand; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    }
}
