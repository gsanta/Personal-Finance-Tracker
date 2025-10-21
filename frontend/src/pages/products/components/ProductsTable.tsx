import useIsMobile from '@/hooks/useIsMobile';
import { Products } from '../hooks/useGetProducts';
import { useMemo, useState } from 'react';
import ImageUploadDialog from '@/components/ImageUploadDialog';
import ProductCard from './ProductCard';

type ProductsTableProps = {
  products: Products;
  page: number;
  setPage: (page: number) => void;
};

const ITEMS_PER_PAGE = 10;

const ProductsTable = ({ products, page, setPage }: ProductsTableProps) => {
  const currentPage = page || 1;

  const pages = useMemo(() => Math.ceil(products.totalCount / ITEMS_PER_PAGE), [products.totalCount]);

  const [productId, setProductId] = useState<string>();

  const handleOpenUploadDialog = (productId: string) => {
    setProductId(productId);
    const dialog = document.getElementById('image-upload-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-4">
        {products.items.map((product) => {
          return <ProductCard key={product.id} product={product} handleOpenUploadDialog={handleOpenUploadDialog} />;
        })}
        <ImageUploadDialog
          onClose={() => {
            setProductId(undefined);
          }}
          productId={productId}
        />
      </div>
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
