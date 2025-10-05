import useIsMobile from '@/hooks/useIsMobile';
import { Products } from '../hooks/useGetProducts';
import { useMemo } from 'react';

type ProductsTableProps = {
  products: Products;
  page: number;
  setPage: (page: number) => void;
};

const ITEMS_PER_PAGE = 10;

const ProductsTable = ({ products, page, setPage }: ProductsTableProps) => {
  const isMobile = useIsMobile();

  const currentPage = page || 1;

  const pages = useMemo(() => Math.ceil(products.totalCount / ITEMS_PER_PAGE), [products.totalCount]);

  return (
    <>
      <table className={`table bg-neutral rounded-none ${isMobile ? 'w-full' : 'table-fixed w-[35rem]'}`}>
        <thead>
          <tr className="bg-base-200">
            <th className={`${isMobile ? undefined : 'w-[12rem]'}`}>Name</th>
            <th className={`${isMobile ? undefined : 'w-[8rem]'}`}>Price (HUF)</th>
            <th className={`${isMobile ? undefined : 'w-[10rem]'}`}>Amount</th>
            <th className={`${isMobile ? undefined : 'w-[5rem]'}`}></th>
          </tr>
        </thead>
        <tbody>
          {products.items.map((product) => {
            return (
              <tr key={product.id}>
                <td className="flex flex-col">{product.name}</td>
                <td>{product.price}</td>
                <td>{product.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="card-actions justify-end">
        <div className="join">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`join-item btn ${i === currentPage - 1 ? 'btn-primary' : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductsTable;
