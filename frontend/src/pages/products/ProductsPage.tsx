import useGetProducts, { Products } from './hooks/useGetProducts';
import useIsMobile from '@/hooks/useIsMobile';
import ProductsTable from './components/ProductsTable';
import useQueryParam from '@/utils/useQueryParam';
import Page from '@/components/Page';
import FileUpload from '@/components/FileUpload';

type ProductsPageProps = {
  products: Products;
};

const ProductsPage = ({ products: initialProducts }: ProductsPageProps) => {
  const isMobile = useIsMobile();

  const [page, setPage] = useQueryParam('page', '');

  const { products } = useGetProducts({ page, initialProducts });

  return (
    <Page>
      <div className="flex flex-col gap-4 items-center p-6 bg-base-200">
        <div className="flex gap-4 items-start">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Transactions</h3>
                {isMobile && (
                  <button
                    className="btn btn-primary"
                    onClick={() => (document.getElementById('new-payment-dialog') as HTMLDialogElement)?.showModal()}
                  >
                    Add transaction
                  </button>
                )}
              </div>
              <div className="divider"></div>
              <ProductsTable
                products={products}
                page={Number(page)}
                setPage={(newPage: number) => setPage(String(newPage))}
              />
            </div>
          </div>

          <FileUpload />

          {/* <NewPayment refetchPayments={refetchPayments} /> */}
        </div>
      </div>
    </Page>
  );
};

export default ProductsPage;
