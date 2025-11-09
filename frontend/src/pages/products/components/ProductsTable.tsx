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

type ItemsLayoutDesktopProps = {
  products: Products;
  handleOpenUploadDialog: (productId: string) => void;
};

const ItemsLayoutDesktop = ({ products, handleOpenUploadDialog }: ItemsLayoutDesktopProps) => {
  return Array.from({ length: Math.ceil(products.items.length / 3) }, (_, groupIndex) => {
    const groupItems = products.items.slice(groupIndex * 3, (groupIndex + 1) * 3);
    return (
      <div key={groupIndex} className="flex gap-4 max-w-fit">
        {groupItems.map((product) => {
          return <ProductCard key={product.id} product={product} handleOpenUploadDialog={handleOpenUploadDialog} />;
        })}
      </div>
    );
  });
};

const ItemsLayoutMobile = ({ products, handleOpenUploadDialog }: ItemsLayoutDesktopProps) => {
  return (
    <div className="flex flex-col gap-4">
      {products.items.map((product) => {
        return <ProductCard key={product.id} product={product} handleOpenUploadDialog={handleOpenUploadDialog} />;
      })}
    </div>
  );
};

const ProductsTable = ({ products, page, setPage }: ProductsTableProps) => {
  const currentPage = page || 1;

  const pages = useMemo(() => Math.ceil(products.totalCount / ITEMS_PER_PAGE), [products.totalCount]);

  const [productId, setProductId] = useState<string>();

  const isMobile = useIsMobile();
  console.log(isMobile);

  const handleOpenUploadDialog = (productId: string) => {
    setProductId(productId);
    const dialog = document.getElementById('image-upload-dialog') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center p-4 w-full pb-20 gap-4">
        {isMobile ? (
          <ItemsLayoutMobile products={products} handleOpenUploadDialog={handleOpenUploadDialog} />
        ) : (
          <ItemsLayoutDesktop products={products} handleOpenUploadDialog={handleOpenUploadDialog} />
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 shadow-lg">
        <div className="card-actions justify-center">
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
        <ImageUploadDialog
          onClose={() => {
            setProductId(undefined);
          }}
          productId={productId}
        />
      </div>
    </div>
  );
};

export default ProductsTable;
