package com.QuitQ.QuitQBackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderDto {
    private Long orderId;
    private String status;
    private BigDecimal total;
    private LocalDateTime createdAt;
    private String paymentMethod;
    private ShippingDto shipping;
    private List<OrderItemDto> items = new ArrayList<>();

    public OrderDto() {}

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public ShippingDto getShipping() { return shipping; }
    public void setShipping(ShippingDto shipping) { this.shipping = shipping; }

    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }

    public static class OrderItemDto {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
        private String status;

        public OrderItemDto() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public BigDecimal getLineTotal() { return lineTotal; }
        public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
        public String getStatus() { return status; }       
        public void setStatus(String status) { this.status = status; }
    }

    public static class ShippingDto {
        private String name;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phone;

        public ShippingDto() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getLine1() { return line1; }
        public void setLine1(String line1) { this.line1 = line1; }
        public String getLine2() { return line2; }
        public void setLine2(String line2) { this.line2 = line2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}
