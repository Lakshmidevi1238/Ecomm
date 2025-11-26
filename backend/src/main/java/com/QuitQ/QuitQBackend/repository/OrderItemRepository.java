package com.QuitQ.QuitQBackend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.QuitQ.QuitQBackend.model.OrderItem;

import java.util.Optional;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByProduct_SellerId(Long sellerId);
    
    Optional<OrderItem> findByIdAndProduct_SellerId(Long id, Long sellerId);
}
