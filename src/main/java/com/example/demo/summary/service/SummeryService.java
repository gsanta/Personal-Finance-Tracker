package com.example.demo.summary.service;

import com.example.demo.summary.presenter.CategorySummaryPresenter;
import com.example.demo.summary.presenter.MonthlyBalancePresenter;
import com.example.demo.summary.presenter.MonthlyCategorySummaryPresenter;
import com.example.demo.summary.presenter.MonthlySummaryPresenter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SummeryService {
    private final SummeryRepository repo;

    public SummeryService(SummeryRepository repo) {
        this.repo = repo;
    }

    public MonthlySummaryPresenter getMonthlyIncomeAndExpenseSummary(int year) {
        List<Object[]> results = repo.findMonthlyIncomeAndExpenseSummary(year);
        List<MonthlyBalancePresenter> months = new java.util.ArrayList<>();
        for (Object[] row : results) {
            int month = ((Number) row[1]).intValue();
            java.math.BigDecimal totalIncome = (java.math.BigDecimal) row[2];
            java.math.BigDecimal totalExpense = (java.math.BigDecimal) row[3];
            months.add(new MonthlyBalancePresenter(month, totalIncome, totalExpense));
        }
        return new MonthlySummaryPresenter(year, months);
    }

    public java.math.BigDecimal getNetBalance() {
        return repo.findOverallNetBalance();
    }

    public MonthlyCategorySummaryPresenter getCategorySummaryByYearAndMonth(int year, int month) {
        List<Object[]> results = repo.findCategorySummaryByYearAndMonth(year, month);
        List<CategorySummaryPresenter> summaries = new java.util.ArrayList<>();
        for (Object[] row : results) {
            String category = (String) row[0];
            java.math.BigDecimal totalIncome = (java.math.BigDecimal) row[1];
            java.math.BigDecimal totalExpense = (java.math.BigDecimal) row[2];
            summaries.add(new CategorySummaryPresenter(category, totalIncome, totalExpense));
        }

        return new MonthlyCategorySummaryPresenter(summaries, month, year);
    }
}
