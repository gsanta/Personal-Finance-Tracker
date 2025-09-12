package com.example.demo.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
}
