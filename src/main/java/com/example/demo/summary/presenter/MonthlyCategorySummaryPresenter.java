package com.example.demo.summary.presenter;

import java.util.List;

public class MonthlyCategorySummaryPresenter {
    List<CategorySummaryPresenter> categories;

    int month;

    int year;

    public MonthlyCategorySummaryPresenter(List<CategorySummaryPresenter> categories, int month, int year) {
        this.categories = categories;
        this.month = month;
        this.year = year;
    }

    public List<CategorySummaryPresenter> getCategories() {
        return categories;
    }

    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }
}
