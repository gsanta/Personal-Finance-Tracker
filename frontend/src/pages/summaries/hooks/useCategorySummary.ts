import { api, categorySummaryPath } from '@/utils/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import CategoryMonthlySummary from '../types/CategoryMonthlySummary';
import { useState } from 'react';

type UseCategorySummaryProps = {
  initialCategories: CategoryMonthlySummary;
  year: number;
  month: number;
};

const useCategorySummary = ({ initialCategories, year, month }: UseCategorySummaryProps) => {
  const { data: category } = useQuery<AxiosResponse<CategoryMonthlySummary>, unknown, CategoryMonthlySummary>({
    queryKey: ['categories', year, month],
    queryFn: async () => {
      const data = await api.get(
        categorySummaryPath({
          params: { year, month },
        }),
      );
      return data;
    },
    initialData: {
      data: initialCategories,
    } as AxiosResponse<CategoryMonthlySummary>,
    retry: false,
    select: (response) => response.data,
    // staleTime: 2000,
  });

  return {
    category,
  };
};

export default useCategorySummary;
