// OrderRepository.java
package com.QuitQ.QuitQBackend.repository;

import com.QuitQ.QuitQBackend.model.Order;
import com.QuitQ.QuitQBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
}
