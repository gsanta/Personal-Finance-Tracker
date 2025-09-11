package com.example.demo.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findAll(Pageable pageable);
}
