
package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.CartItem;
import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.User;
import com.QuitQ.QuitQBackend.repository.CartItemRepository;
import com.QuitQ.QuitQBackend.repository.ProductRepository;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;

    @Autowired
    public CartServiceImpl(CartItemRepository cartRepo,
                           UserRepository userRepo,
                           ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
    }

    @Override
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        final int qty = (quantity == null || quantity < 1) ? 1 : quantity;
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

       
        return cartRepo.findByUserAndProduct(user, product)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + qty);
                    return cartRepo.save(existing);
                })
                .orElseGet(() -> {
                    CartItem item = new CartItem(user, product, qty);
                    return cartRepo.save(item);
                });
    }

    

    @Override
    public CartItem updateCartItem(Long cartItemId, Integer quantity) {
        CartItem item = cartRepo.findById(cartItemId).orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (quantity == null || quantity < 1) throw new IllegalArgumentException("Quantity must be >= 1");
        item.setQuantity(quantity);
        return cartRepo.save(item);
    }

    @Override
    public void removeCartItem(Long cartItemId) {
        if (!cartRepo.existsById(cartItemId)) throw new RuntimeException("Cart item not found");
        cartRepo.deleteById(cartItemId);
    }

    @Override
    public List<CartItem> getCartItems(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return cartRepo.findByUser(user);
    }

    @Override
    public void clearCart(Long userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        cartRepo.deleteByUser(user);
    }
}
