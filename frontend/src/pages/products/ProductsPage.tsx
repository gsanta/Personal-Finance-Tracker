import useGetProducts, { Products } from './hooks/useGetProducts';
import ProductsTable from './components/ProductsTable';
import useQueryParam from '@/utils/useQueryParam';
import Page from '@/components/Page';

type ProductsPageProps = {
  products: Products;
};

const ProductsPage = ({ products: initialProducts }: ProductsPageProps) => {
  const [page, setPage] = useQueryParam('page', '');

  const { products } = useGetProducts({ page, initialProducts });

  return (
    <Page>
      <div className="flex flex-col gap-4 items-center p-6">
        <div className="flex gap-4 items-start">
          <div className="card shadow-xl">
            <ProductsTable
              products={products}
              page={Number(page)}
              setPage={(newPage: number) => setPage(String(newPage))}
            />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ProductsPage;
