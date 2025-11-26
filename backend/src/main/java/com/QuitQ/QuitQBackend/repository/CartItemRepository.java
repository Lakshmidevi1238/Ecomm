
package com.QuitQ.QuitQBackend.repository;

import com.QuitQ.QuitQBackend.model.CartItem;
import com.QuitQ.QuitQBackend.model.Product;
import com.QuitQ.QuitQBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUser(User user);
}

