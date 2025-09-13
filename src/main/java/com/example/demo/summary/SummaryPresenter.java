package com.example.demo.summary;

import com.example.demo.payment.Payment;
import com.example.demo.payment.PaymentService;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

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
