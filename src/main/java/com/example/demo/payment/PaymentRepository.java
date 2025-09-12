package com.example.demo.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Page<Payment> findAll(Pageable pageable);
    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
