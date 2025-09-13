package com.example.demo.summary;

import java.math.BigDecimal;

public class MonthlyBalancePresenter {
    public final int month;
    public final java.math.BigDecimal totalIncome;
    public final java.math.BigDecimal totalExpense;

    public MonthlyBalancePresenter(int month, java.math.BigDecimal totalIncome, java.math.BigDecimal totalExpense) {
        this.month = month;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
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
