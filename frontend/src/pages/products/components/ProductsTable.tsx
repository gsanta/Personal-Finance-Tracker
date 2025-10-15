import useIsMobile from '@/hooks/useIsMobile';
import { Products } from '../hooks/useGetProducts';
import { useMemo, useRef } from 'react';
import ImageUploadDialog from '@/components/ImageUploadDialog';
import { BiCheck, BiImageAdd } from 'react-icons/bi';

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

  const productIdRef = useRef<string>();

  const handleOpenUploadDialog = (productId: string) => {
    productIdRef.current = productId;
    const dialog = document.getElementById('image-upload-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-4">
        {products.items.map((product) => {
          return (
            <div className="card bg-base-100 shadow-sm w-[20rem]" key={product.id}>
              <figure>
                <img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{product.name}</h2>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-outline btn-sm btn-square"
                    onClick={() => handleOpenUploadDialog(product.id)}
                  >
                    <BiImageAdd size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <ImageUploadDialog
          onClose={() => {
            productIdRef.current = undefined;
          }}
          productId={productIdRef.current}
        />
      </div>
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
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => handleOpenUploadDialog(product.id)}>
                    Upload image
                  </button>
                </td>
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
