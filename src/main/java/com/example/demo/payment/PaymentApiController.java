package com.example.demo.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class PaymentApiController {
    private final PaymentService svc;

    public PaymentApiController(PaymentService svc) { this.svc = svc; }

    @GetMapping("/api/payments")
    public PaymentsPresenter sayHello(@RequestParam(defaultValue = "0") int page,
                           @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> paymentsPage = svc.listAll(pageable);
        PaymentsPresenter payments = new PaymentsPresenter(paymentsPage);

        return payments;
    }

    @PostMapping("/api/payments")
    public void create(@RequestBody Payment payment) {
        svc.create(payment);
    }

    @DeleteMapping("/api/payments/{id}")
    public void delete(@PathVariable UUID id) {
        svc.delete(id);
    }
}
