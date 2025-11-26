// CartService.java
package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.CartItem;
import com.QuitQ.QuitQBackend.model.User;

import java.util.List;

public interface CartService {
    CartItem addToCart(Long userId, Long productId, Integer quantity);
    CartItem updateCartItem(Long cartItemId, Integer quantity);
    void removeCartItem(Long cartItemId);
    List<CartItem> getCartItems(Long userId);
    void clearCart(Long userId);
}
