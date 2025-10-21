import { BiImageAdd } from 'react-icons/bi';
import Carousel from './Carousel';
import Product from '../types/Product';

type ProductCardProps = {
  handleOpenUploadDialog: (productId: string) => void;
  product: Product;
};

const ProductCard = ({ product, handleOpenUploadDialog }: ProductCardProps) => {
  return (
    <div className="card bg-base-100 shadow-sm w-[20rem] h-[30rem]" key={product.id}>
      <div className="h-[20rem] flex flex-col justify-around">
        {product.mediaAssets.length > 0 && <Carousel mediaAssets={product.mediaAssets} />}
      </div>
      <div className="card-body">
        <h2 className="card-title">{product.name}</h2>
        <div className="card-actions justify-end">
          <button className="btn btn-outline btn-sm btn-square" onClick={() => handleOpenUploadDialog(product.id)}>
            <BiImageAdd size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
