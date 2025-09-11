package com.example.demo.payment;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class PaymentService {
    private final PaymentRepository repo;

    public PaymentService(PaymentRepository repo) {
        this.repo = repo;
    }

    public Page<Payment> listAll(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Optional<Payment> findById(Long id) {
        return repo.findById(id);
    }

//    @Transactional
//    public Product create(Product p) {
//        return repo.save(p);
//    }
//
//    @Transactional
//    public Product update(UUID id, Product changes) {
//        Product existing = repo.findById(id).orElseThrow();
//        existing.setName(changes.getName());
//        existing.setDescription(changes.getDescription());
//        existing.setQuantity(changes.getQuantity());
//        existing.setPrice(changes.getPrice());
//        existing.setImgUrl(changes.getImgUrl());
//        return repo.save(existing);
//    }
//
//    @Transactional
//    public void delete(Long id) {
//        repo.deleteById(id);
//    }
}
