const ProductDetail = ({ product }) => {
  const breadcrumbCategory = typeof product.category === 'string' ? product.category : product.category.slug;
  const breadcrumbName = typeof product.category === 'object' ? product.category.name : product.category;

  return (
    <div>
      <nav>
        <ul>
          <li>{breadcrumbCategory}</li>
        </ul>
      </nav>
      <h1>{product.name}</h1>
    </div>
  );
};

export default ProductDetail;