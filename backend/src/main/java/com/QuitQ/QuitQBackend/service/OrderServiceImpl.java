package com.QuitQ.QuitQBackend.service;

import com.QuitQ.QuitQBackend.dto.OrderRequest;
import com.QuitQ.QuitQBackend.model.*;
import com.QuitQ.QuitQBackend.repository.CartItemRepository;
import com.QuitQ.QuitQBackend.repository.OrderItemRepository;
import com.QuitQ.QuitQBackend.repository.OrderRepository;
import com.QuitQ.QuitQBackend.repository.ProductRepository;
import com.QuitQ.QuitQBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final CartItemRepository cartRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;

    private static final List<String> STATUS_SEQUENCE = Arrays.asList("PLACED", "PROCESSING", "SHIPPED", "DELIVERED");

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepo,
                            OrderItemRepository orderItemRepo,
                            CartItemRepository cartRepo,
                            UserRepository userRepo,
                            ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.cartRepo = cartRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
    }

    @Override
    public Order createOrderFromCart(Long userId, OrderRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> items = cartRepo.findByUser(user);
        if (items.isEmpty()) throw new RuntimeException("Cart is empty");


        StringBuilder insufficient = new StringBuilder();
        for (CartItem ci : items) {
            Product p = productRepo.findById(ci.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + ci.getProduct().getId()));
            if (p.getStock() < ci.getQuantity()) {
                insufficient.append(p.getName())
                        .append(" (available=").append(p.getStock())
                        .append(", requested=").append(ci.getQuantity())
                        .append("); ");
            }
        }
        if (insufficient.length() > 0) {
            throw new RuntimeException("Insufficient stock for: " + insufficient);
        }

        Order order = new Order(user);


        if (req != null && req.getShipping() != null) {
            OrderRequest.Shipping s = req.getShipping();
            order.setShipName(s.getName());
            order.setShipLine1(s.getLine1());
            order.setShipLine2(s.getLine2());
            order.setShipCity(s.getCity());
            order.setShipState(s.getState());
            order.setShipPostalCode(s.getPostalCode());
            order.setShipCountry(s.getCountry());
            order.setShipPhone(s.getPhone());
        }

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem ci : items) {
            Product p = productRepo.findById(ci.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            p.setStock(p.getStock() - ci.getQuantity());
            productRepo.save(p);

            OrderItem oi = new OrderItem(order, p, ci.getQuantity(), p.getPrice());
            order.getItems().add(oi);
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        order.setTotal(total);


        if (req != null && req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank()) {
            order.setPaymentMethod(req.getPaymentMethod().trim().toUpperCase());
            order.setStatus(req.getPaymentMethod().equalsIgnoreCase("COD") ? "PENDING" : "PAID");
        } else {
            order.setPaymentMethod("COD");
            order.setStatus("PENDING");
        }

     
        Order saved = orderRepo.save(order);

        for (OrderItem oi : saved.getItems()) {
            oi.setOrder(saved);
            orderItemRepo.save(oi);
        }

    
        cartRepo.deleteByUser(user);

        return saved;
    }

    @Override
    public Order getById(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getOrdersForUser(Long userId) {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepo.findByUser(u);
    }

    @Override
    public List<OrderItem> listOrderItemsForSeller(Long sellerId) {
        return orderItemRepo.findByProduct_SellerId(sellerId);
    }

    @Override
    public OrderItem updateOrderItemStatus(Long sellerId, Long orderItemId, String newStatus) {
        if (newStatus == null || newStatus.isBlank()) {
            throw new RuntimeException("newStatus is required");
        }

        newStatus = newStatus.trim().toUpperCase();

        if (!STATUS_SEQUENCE.contains(newStatus)) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        Optional<OrderItem> opt = orderItemRepo.findByIdAndProduct_SellerId(orderItemId, sellerId);
        if (opt.isEmpty()) {
            throw new RuntimeException("Order item not found or not owned by seller");
        }

        OrderItem oi = opt.get();
        String current = oi.getStatus() == null ? "PLACED" : oi.getStatus().toUpperCase();

        int currIdx = STATUS_SEQUENCE.indexOf(current);
        int newIdx = STATUS_SEQUENCE.indexOf(newStatus);

        if (currIdx == -1) {
            throw new RuntimeException("Current item status is invalid: " + current);
        }

        if (newIdx < currIdx) {
            throw new RuntimeException("Invalid status transition: cannot change from " + current + " to " + newStatus);
        }

        oi.setStatus(newStatus);
        return orderItemRepo.save(oi);
    }
}
