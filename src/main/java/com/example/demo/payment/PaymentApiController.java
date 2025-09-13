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
    public PaymentsPresenter listPayments(@RequestParam(defaultValue = "1") int page,
                           @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Payment> paymentsPage = svc.listAll(pageable);

        return new PaymentsPresenter(paymentsPage);
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
