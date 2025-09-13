package com.example.demo.summary;

import com.example.demo.summary.MonthlyCategorySummaryPresenter;
import com.example.demo.summary.SummeryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class SummaryApiController {
    private final SummeryService svc;

    public SummaryApiController(SummeryService svc) { this.svc = svc; }

    @GetMapping("/api/summary/category")
    public MonthlyCategorySummaryPresenter getSummaryCategory(@RequestParam(required = false) Integer year,
                                      @RequestParam(required = false) Integer month) {

        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        return this.svc.getCategorySummaryByYearAndMonth(year, month);
    }

    @GetMapping("/api/summary/monthly")
    public MonthlySummaryPresenter getSummaryMonthly(@RequestParam(required = false) Integer year) {

        if (year == null) year = LocalDate.now().getYear();

        return this.svc.getMonthlyIncomeAndExpenseSummary(year);
    }
}
