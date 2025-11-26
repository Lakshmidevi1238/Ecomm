package com.QuitQ.QuitQBackend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> items = new HashSet<>();

    private BigDecimal total = BigDecimal.ZERO;

    private String status = "PENDING"; 

 
    @Column(name = "payment_method")
    private String paymentMethod; 

    private String shipName;
    private String shipLine1;
    private String shipLine2;
    private String shipCity;
    private String shipState;
    private String shipPostalCode;
    private String shipCountry;
    private String shipPhone;

    public Order() {}

    public Order(User user) {
        this.user = user;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<OrderItem> getItems() { return items; }
    public void setItems(Set<OrderItem> items) { this.items = items; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getShipName() { return shipName; }
    public void setShipName(String shipName) { this.shipName = shipName; }

    public String getShipLine1() { return shipLine1; }
    public void setShipLine1(String shipLine1) { this.shipLine1 = shipLine1; }

    public String getShipLine2() { return shipLine2; }
    public void setShipLine2(String shipLine2) { this.shipLine2 = shipLine2; }

    public String getShipCity() { return shipCity; }
    public void setShipCity(String shipCity) { this.shipCity = shipCity; }

    public String getShipState() { return shipState; }
    public void setShipState(String shipState) { this.shipState = shipState; }

    public String getShipPostalCode() { return shipPostalCode; }
    public void setShipPostalCode(String shipPostalCode) { this.shipPostalCode = shipPostalCode; }

    public String getShipCountry() { return shipCountry; }
    public void setShipCountry(String shipCountry) { this.shipCountry = shipCountry; }

    public String getShipPhone() { return shipPhone; }
    public void setShipPhone(String shipPhone) { this.shipPhone = shipPhone; }
}
