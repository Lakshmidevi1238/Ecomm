package com.QuitQ.QuitQBackend.controller;

import com.QuitQ.QuitQBackend.dto.OrderDto;
import com.QuitQ.QuitQBackend.dto.OrderRequest;
import com.QuitQ.QuitQBackend.model.Order;
import com.QuitQ.QuitQBackend.model.OrderItem;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.service.OrderService;
import com.QuitQ.QuitQBackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


 
@RestController
@RequestMapping("/api/v1")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    @Autowired
    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        String email = authentication.getName();
        return userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }


    @PostMapping("/orders/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody OrderRequest req, Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        try {
            Order order = orderService.createOrderFromCart(user.getId(), req);
            return ResponseEntity.status(201).body(toDto(order));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        List<Order> orders = orderService.getOrdersForUser(user.getId());
        List<OrderDto> dtos = orders.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable("id") Long id, Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        try {
            Order order = orderService.getById(id);
            if (!order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
            }
            return ResponseEntity.ok(toDto(order));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }


    @GetMapping("/seller/orders")
    public ResponseEntity<?> sellerListOrders(Authentication authentication) {
        User seller = currentUser(authentication);
        if (seller == null) return ResponseEntity.status(401).body("Unauthorized");
        try {
            List<OrderItem> items = orderService.listOrderItemsForSeller(seller.getId());
            return ResponseEntity.ok(items.stream().map(this::toItemDto).collect(Collectors.toList()));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }


    @GetMapping("/seller/orders/items/{itemId}")
    public ResponseEntity<?> sellerGetOrderItem(@PathVariable Long itemId, Authentication authentication) {
        User seller = currentUser(authentication);
        if (seller == null) return ResponseEntity.status(401).body("Unauthorized");
        try {
            OrderItem oi = orderService.updateOrderItemStatus(seller.getId(), itemId, null); 
            return ResponseEntity.ok(toItemDto(oi));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/seller/orders/items/{itemId}/status")
    public ResponseEntity<?> sellerUpdateOrderItemStatus(@PathVariable Long itemId,
                                                         @RequestBody Map<String, String> body,
                                                         Authentication authentication) {
        User seller = currentUser(authentication);
        if (seller == null) return ResponseEntity.status(401).body("Unauthorized");
        String newStatus = body.get("status");
        try {
            OrderItem updated = orderService.updateOrderItemStatus(seller.getId(), itemId, newStatus);
            return ResponseEntity.ok(toItemDto(updated));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }


    private OrderDto toDto(Order o) {
        OrderDto dto = new OrderDto();
        dto.setOrderId(o.getId());
        dto.setStatus(o.getStatus());
        dto.setTotal(o.getTotal());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setPaymentMethod(o.getPaymentMethod());
        
        OrderDto.ShippingDto ship = new OrderDto.ShippingDto();
        ship.setName(o.getShipName());
        ship.setLine1(o.getShipLine1());
        ship.setLine2(o.getShipLine2());
        ship.setCity(o.getShipCity());
        ship.setState(o.getShipState());
        ship.setPostalCode(o.getShipPostalCode());
        ship.setCountry(o.getShipCountry());
        ship.setPhone(o.getShipPhone());
        dto.setShipping(ship);

        for (OrderItem oi : o.getItems()) {
            OrderDto.OrderItemDto item = new OrderDto.OrderItemDto();
            item.setProductId(oi.getProduct().getId());
            item.setProductName(oi.getProduct().getName());
            item.setQuantity(oi.getQuantity());
            item.setUnitPrice(oi.getPrice());
            item.setLineTotal(oi.getPrice().multiply(java.math.BigDecimal.valueOf(oi.getQuantity())));
            item.setStatus(oi.getStatus()); 
            dto.getItems().add(item);
        }

        return dto;
    }

    private Map<String, Object> toItemDto(OrderItem oi) {
        return Map.of(
                "itemId", oi.getId(),
                "orderId", oi.getOrder().getId(),
                "productId", oi.getProduct().getId(),
                "productName", oi.getProduct().getName(),
                "quantity", oi.getQuantity(),
                "unitPrice", oi.getPrice(),
                "status", oi.getStatus()
        );
    }
}
