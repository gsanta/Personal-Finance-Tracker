package com.example.demo.summary.presenter;

import java.math.BigDecimal;

public class SummaryPresenter {

    private final MonthlySummaryPresenter monthly;

    private final java.math.BigDecimal netBalance;

    private final MonthlyCategorySummaryPresenter category;

    public SummaryPresenter(MonthlySummaryPresenter monthly, java.math.BigDecimal netBalance, MonthlyCategorySummaryPresenter category) {
        this.monthly = monthly;
        this.netBalance = netBalance;
        this.category = category;
    }

    public MonthlySummaryPresenter getMonthly() {
        return monthly;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public MonthlyCategorySummaryPresenter getCategory() {
        return category;
    }
}
