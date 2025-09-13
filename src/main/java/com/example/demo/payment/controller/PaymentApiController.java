package com.example.demo.payment.controller;

import com.example.demo.payment.service.Payment;
import com.example.demo.payment.service.PaymentService;
import com.example.demo.payment.presenter.PaymentsPresenter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        Payment saved = svc.create(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/api/payments/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!svc.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }
}
