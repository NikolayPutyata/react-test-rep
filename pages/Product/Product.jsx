import { useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

const Product = () => {
  const params = useParams();
  const loc = useLocation();
  const back = useRef(loc.state ?? './products');

  return (
    <div>
      <Link to={back.current}>Back</Link>
      <h1>Auto</h1>
    </div>
  );
};

export default Product;
