package com.example.demo.summary;

import com.example.demo.payment.PaymentService;
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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/summaries")
public class SummaryController {
    private final SummeryService svc;

    private static final Logger logger = LoggerFactory.getLogger(SummaryController.class);

    public SummaryController(SummeryService svc) { this.svc = svc; }

    @GetMapping
    public String list(@RequestParam(required = false) Integer year,
                       @RequestParam(required = false) Integer month,  Model model) throws JsonProcessingException {

        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        MonthlySummaryPresenter monthly = this.svc.getMonthlyIncomeAndExpenseSummary(year);
        java.math.BigDecimal netBalance = this.svc.getNetBalance();
        MonthlyCategorySummaryPresenter category = this.svc.getCategorySummaryByYearAndMonth(year, month);

        SummaryPresenter summary = new SummaryPresenter(monthly, netBalance, category);

        model.addAttribute("pageProps", summary);

        return "application";
    }
}
