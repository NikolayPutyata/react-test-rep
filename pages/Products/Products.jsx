import { Link, useLocation } from 'react-router-dom';
import SearchForm from '../../src/components/SearchForm/SearchForm';
import { useState } from 'react';

const products = [
  { id: 1, name: 'Audi' },
  { id: 2, name: 'BMW' },
  { id: 3, name: 'Honda' },
];

const Products = () => {
  const [searchingWord, setSearchingWord] = useState('');
  const loc = useLocation();

  const filterArr = products.filter(car =>
    car.name.toLowerCase().includes(searchingWord.toLowerCase())
  );
  return (
    <div>
      <SearchForm setWord={setSearchingWord} />
      <ul>
        {filterArr.map(({ id, name }) => (
          <li key={id}>
            <Link to={`/products/${id}`} state={loc}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;
