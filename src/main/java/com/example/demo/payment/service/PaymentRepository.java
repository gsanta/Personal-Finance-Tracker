package com.example.demo.payment.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Page<Payment> findAll(Pageable pageable);
    Page<Payment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("""
        SELECT YEAR(p.createdAt) as year, MONTH(p.createdAt) as month,
               SUM(CASE WHEN p.isIncome = true THEN p.amount ELSE 0 END) as totalIncome,
               SUM(CASE WHEN p.isIncome = false THEN p.amount ELSE 0 END) as totalExpense
        FROM Payment p
        GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)
        ORDER BY year DESC, month DESC
    """)
    List<Object[]> findMonthlyIncomeAndExpenseSummary();
}
