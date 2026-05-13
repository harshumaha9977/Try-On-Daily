import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-xl transition-all duration-300 border border-border">
      <div className="aspect-[4/5] overflow-hidden bg-gray-100">
        <img loading="lazy"
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to="/try-on"
            className="px-6 py-3 bg-white text-black font-medium rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-gray-100"
          >
            Try it On
          </Link>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-foreground/50">
              {product.category}
            </p>
          </div>
          <p className="text-lg font-semibold text-foreground">
            ${product.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
