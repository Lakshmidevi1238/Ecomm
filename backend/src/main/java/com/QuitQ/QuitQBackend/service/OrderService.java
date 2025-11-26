package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.model.Order;
import com.QuitQ.QuitQBackend.dto.OrderRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.QuitQ.QuitQBackend.model.OrderItem;

import java.util.List;

public interface OrderService {
    Order createOrderFromCart(Long userId, OrderRequest req); // checkout - now takes shipping/payment
    Order getById(Long id);
    List<Order> getOrdersForUser(Long userId);
    List<OrderItem> listOrderItemsForSeller(Long sellerId);

    OrderItem updateOrderItemStatus(Long sellerId, Long orderItemId, String newStatus);
}
