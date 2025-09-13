package com.example.demo.summary.service;

import com.example.demo.payment.service.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SummeryRepository  extends JpaRepository<Payment, UUID> {
    // Returns year, month, totalIncome, totalExpense
    @org.springframework.data.jpa.repository.Query("""
        SELECT YEAR(p.createdAt) as year, MONTH(p.createdAt) as month,
               SUM(CASE WHEN p.isIncome = true THEN p.amount ELSE 0 END) as totalIncome,
               SUM(CASE WHEN p.isIncome = false THEN p.amount ELSE 0 END) as totalExpense
        FROM Payment p
        WHERE YEAR(p.createdAt) = :year
        GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)
        ORDER BY year DESC, month DESC
    """)
    List<Object[]> findMonthlyIncomeAndExpenseSummary(int year);


    // Returns overall net balance (income - expense) for all payments
    @org.springframework.data.jpa.repository.Query("""
        SELECT COALESCE(SUM(CASE WHEN p.isIncome = true THEN p.amount ELSE 0 END) - SUM(CASE WHEN p.isIncome = false THEN p.amount ELSE 0 END), 0)
        FROM Payment p
    """)
    java.math.BigDecimal findOverallNetBalance();

    // Returns category, totalIncome, totalExpense for a given year and month
    @org.springframework.data.jpa.repository.Query("""
        SELECT p.category,
                SUM(CASE WHEN p.isIncome = true THEN p.amount ELSE 0 END) as totalIncome,
                SUM(CASE WHEN p.isIncome = false THEN p.amount ELSE 0 END) as totalExpense
        FROM Payment p
        WHERE YEAR(p.createdAt) = :year AND MONTH(p.createdAt) = :month
        GROUP BY p.category
        ORDER BY p.category
    """)
    List<Object[]> findCategorySummaryByYearAndMonth(int year, int month);
}
