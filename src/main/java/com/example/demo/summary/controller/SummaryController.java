package com.example.demo.summary.controller;

import com.example.demo.summary.presenter.SummaryPresenter;
import com.example.demo.summary.service.SummeryService;
import com.example.demo.summary.presenter.MonthlyCategorySummaryPresenter;
import com.example.demo.summary.presenter.MonthlySummaryPresenter;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

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
