package com.example.demo.payment.presenter;

import com.example.demo.payment.service.Payment;
import org.springframework.data.domain.Page;

import java.util.List;

public class PaymentsPresenter {

    private final long totalCount;

    private final List<Payment> items;

    public PaymentsPresenter() {
        this.totalCount = 0;
        this.items = List.of();
    }

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
