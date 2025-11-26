package com.QuitQ.QuitQBackend.controller;

import com.QuitQ.QuitQBackend.dto.CartDto;
import com.QuitQ.QuitQBackend.dto.CartRequest;
import com.QuitQ.QuitQBackend.model.CartItem;
import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.service.CartService;
import com.QuitQ.QuitQBackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @Autowired
    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }


    private User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        String email = authentication.getName();
        return userService.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/cart/items")
    public ResponseEntity<?> addItem(@Valid @RequestBody CartRequest.AddItemRequest req,
                                     Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        try {
            CartItem added = cartService.addToCart(user.getId(), req.getProductId(), req.getQuantity());
            return ResponseEntity.status(201).body(cartItemToDto(added));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(java.util.Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/cart/items/{id}")
    public ResponseEntity<?> updateItem(@PathVariable("id") Long id,
                                        @Valid @RequestBody CartRequest.UpdateItemRequest req,
                                        Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        try {
            
            CartItem updated = cartService.updateCartItem(id, req.getQuantity());
            if (!updated.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(java.util.Map.of("message", "Forbidden"));
            }
            return ResponseEntity.ok(cartItemToDto(updated));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/cart/items/{id}")
    public ResponseEntity<?> removeItem(@PathVariable("id") Long id, Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        try {
            
            CartItem item = cartService.getCartItems(user.getId())
                    .stream().filter(ci -> ci.getId().equals(id)).findFirst()
                    .orElseThrow(() -> new RuntimeException("Cart item not found"));
            if (!item.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(java.util.Map.of("message", "Forbidden"));
            }
            cartService.removeCartItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/cart")
    public ResponseEntity<?> viewCart(Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<CartItem> items = cartService.getCartItems(user.getId());
        CartDto dto = new CartDto();

        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;
        for (CartItem ci : items) {
            CartDto.CartItemDto itemDto = cartItemToDto(ci);
            dto.getItems().add(itemDto);
            subtotal = subtotal.add(itemDto.getLineTotal());
            totalItems += itemDto.getQuantity();
        }
        dto.setSubtotal(subtotal);
        dto.setTotal(subtotal); 
        dto.setTotalItems(totalItems);

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/cart")
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = currentUser(authentication);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }

    
    private static CartDto.CartItemDto cartItemToDto(CartItem ci) {
        CartDto.CartItemDto dto = new CartDto.CartItemDto();
        dto.setCartItemId(ci.getId());
        Product p = ci.getProduct();
        dto.setProductId(p.getId());
        dto.setProductName(p.getName());
        dto.setQuantity(ci.getQuantity());
        dto.setUnitPrice(p.getPrice());
        dto.setLineTotal(p.getPrice().multiply(java.math.BigDecimal.valueOf(ci.getQuantity())));
        return dto;
    }
}
