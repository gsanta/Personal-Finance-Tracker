package com.example.demo.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PaymentService {
    private final PaymentRepository repo;

    public PaymentService(PaymentRepository repo) {
        this.repo = repo;
    }

    public Page<Payment> listAll(Pageable pageable) {
        return repo.findAllByOrderByCreatedAtDesc(pageable);
    }
    
    @Transactional
    public Payment create(Payment p) {
        return repo.save(p);
    }
        
    @Transactional
    public void delete(UUID id) {
        repo.deleteById(id);
    }

    public List<MonthlySummary> getMonthlyIncomeAndExpenseSummary() {
        List<Object[]> results = repo.findMonthlyIncomeAndExpenseSummary();
        List<MonthlySummary> summaries = new java.util.ArrayList<>();
        for (Object[] row : results) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            java.math.BigDecimal totalIncome = (java.math.BigDecimal) row[2];
            java.math.BigDecimal totalExpense = (java.math.BigDecimal) row[3];
            summaries.add(new MonthlySummary(year, month, totalIncome, totalExpense));
        }
        return summaries;
    }

    public static class MonthlySummary {
        public final int year;
        public final int month;
        public final java.math.BigDecimal totalIncome;
        public final java.math.BigDecimal totalExpense;

        public MonthlySummary(int year, int month, java.math.BigDecimal totalIncome, java.math.BigDecimal totalExpense) {
            this.year = year;
            this.month = month;
            this.totalIncome = totalIncome;
            this.totalExpense = totalExpense;
        }

        public int getYear() {
            return year;
        }

        public int getMonth() {
            return month;
        }

        public BigDecimal getTotalIncome() {
            return totalIncome;
        }

        public BigDecimal getTotalExpense() {
            return totalExpense;
        }
    }
}
