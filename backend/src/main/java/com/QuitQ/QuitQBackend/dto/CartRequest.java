package com.QuitQ.QuitQBackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CartRequest {

    public static class AddItemRequest {
        @NotNull(message = "productId is required")
        private Long productId;

        @Min(value = 1, message = "quantity must be at least 1")
        private Integer quantity = 1;

        public AddItemRequest() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateItemRequest {
        @NotNull(message = "quantity is required")
        @Min(value = 1, message = "quantity must be at least 1")
        private Integer quantity;

        public UpdateItemRequest() {}

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
