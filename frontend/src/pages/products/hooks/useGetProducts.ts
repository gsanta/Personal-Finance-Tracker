import { api, productsPath } from '@/utils/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import Product from '../types/Product';
import { useState } from 'react';

export type Products = {
  totalCount: number;
  items: Product[];
};

type UseGetProductsProps = {
  page: string;
  initialProducts: Products;
};

export const getProductsQueryKey = (page: string) => ['products', page];

const useGetProducts = ({ page, initialProducts }: UseGetProductsProps) => {
  const [initialPage] = useState(page);
  const { data: products, refetch: refetchProducts } = useQuery<AxiosResponse<Products>, unknown, Products>({
    queryKey: getProductsQueryKey(page),
    queryFn: async () => {
      const data = await api.get(
        productsPath({
          params: { page: page ? Number(page) : 1 },
        }),
      );
      return data;
    },
    initialData: {
      data: initialProducts,
    } as AxiosResponse<Products>,
    select: (response) => response.data,
    staleTime: page === initialPage ? 2000 : 0,
  });

  return {
    products,
    refetchProducts,
  };
};

export default useGetProducts;
