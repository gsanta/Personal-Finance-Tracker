package com.example.demo.payment;

import org.springframework.data.domain.Page;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

public class PaymentsPresenter {

    private final long totalCount;

    private final List<Payment> items;

    public PaymentsPresenter(Page<Payment> paymentsPage) {
        this.totalCount = paymentsPage.getTotalElements();
        this.items = paymentsPage.getContent();
    }

    public long getTotalCount() {
        return totalCount;
    }

    public List<Payment> getItems() {
        return items;
    }
}
