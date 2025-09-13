package com.example.demo.payment;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/payments")
public class PaymentController {
    private final PaymentService svc;

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    public PaymentController(PaymentService svc) { this.svc = svc; }

    @GetMapping
    public String list(@RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int size,
                        Model model) throws JsonProcessingException {

        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Payment> paymentsPage = svc.listAll(pageable);
        PaymentsPresenter payments = new PaymentsPresenter(paymentsPage);

        Map<String, Object> pageProps = new HashMap<>();
        pageProps.put("payments", payments);

        model.addAttribute("pageProps", pageProps);

        return "application";
    }
}
