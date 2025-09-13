package com.example.demo.summary.presenter;

import java.util.List;

public class MonthlySummaryPresenter {
    public final int year;

    List<MonthlyBalancePresenter> months;

    public MonthlySummaryPresenter(int year,List<MonthlyBalancePresenter> months) {
        this.year = year;
        this.months = months;
    }

    public int getYear() {
        return year;
    }

    public List<MonthlyBalancePresenter> getMonths() {
        return months;
    }
}
