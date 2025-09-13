package com.example.demo.summary.presenter;

import java.math.BigDecimal;

public class CategorySummaryPresenter {
    public final String category;
    public final java.math.BigDecimal totalIncome;
    public final java.math.BigDecimal totalExpense;

    public CategorySummaryPresenter(String category, java.math.BigDecimal totalIncome, java.math.BigDecimal totalExpense) {
        this.category = category;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
    }

    public String getCategory() {
        return category;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }
}
