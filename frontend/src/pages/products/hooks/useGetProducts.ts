import { api, productsPath } from '@/utils/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import Product from '../types/Payment';

export type Products = {
  totalCount: number;
  items: Product[];
};

type UseGetPaymentsProps = {
  page: string;
  initialPayments: Products;
};

const useGetProducts = ({ page, initialPayments }: UseGetPaymentsProps) => {
  const { data: payments, refetch: refetchPayments } = useQuery<AxiosResponse<Products>, unknown, Products>({
    queryKey: ['products', page],
    queryFn: async () => {
      const data = await api.get(
        productsPath({
          params: { page: page ? Number(page) : 1 },
        }),
      );
      return data;
    },
    initialData: {
      data: initialPayments,
    } as AxiosResponse<Products>,
    select: (response) => response.data,
    // staleTime: 2000,
  });

  return {
    payments,
    refetchPayments,
  };
};

export default useGetProducts;
