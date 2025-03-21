Задача 1: Список пользователей с фильтрацией и обновлением

Описание: Создайте компонент, который отображает список пользователей. Добавьте
функциональность поиска по имени пользователя (через filter). При каждом
изменении поля поиска, отфильтруйте список. Используйте useState для хранения
списка пользователей и поискового запроса, а useEffect — для сохранения
изменений в локальном хранилище.

Требования:

Список пользователей хранится в useState. При изменении строки поиска
используйте метод filter, чтобы отображать только пользователей, имена которых
соответствуют поисковому запросу. useEffect используется для синхронизации
списка с localStorage.

/////////////////////////////////////////////////

<!-- 1. Создадим хук и запишем туда начальные значения масива. -->

<!-- 2. Создадим хук для сохранения слова или символов что будет вводить
   пользователей. -->

<!-- 3. Создадим поле ввода для поиска. -->

<!-- 4. Передадим значения хука сохранения вводных пользователя компоненту с вводом
   того что будем записывать в этот хук данные. -->

<!-- 5. запишем у константу отфильтрованый масив, елементы которого включают в себя
   то что ввел пользователь. -->

<!-- 6. Создадим компонет который будет принимать отфильтрованый масив и вырисовывать
   его. -->

<!-- 7. Создадим хук который будет записывать пользователей в браузерное хранилище. -->
<!-- 8. Изменим начальное значение хука который хранит список пользователей на кол
   бек что делает запрос на браузерное хранилище. -->

Решение :

   <!-- App.jsx -->

   <!-- import { useState } from 'react';
import SearchArea from './UsersList/SearchArea';
import UsersList from './UsersList/UsersList';

const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Alex Johnson' },
  { id: 4, name: 'Emily Davis' },
  { id: 5, name: 'Michael Brown' },
];

const App = () => {
  const [usersList, setUsersList] = useState(() => {
    const data = window.localStorage.getItem('data');
    if (data !== null) {
      return JSON.parse(data);
    }

    return users;
  });
  const [userWord, setUserWord] = useState('');

  useState(() => {
    window.localStorage.setItem('data', JSON.stringify(usersList));
  }, [usersList]);

  const filterArr = usersList.filter(item =>
    item.name.toLowerCase().includes(userWord.toLowerCase())
  );

  return (
    <>
      <UsersList arr={filterArr} />
      <SearchArea value={userWord} onChangeFu={setUserWord} />
    </>
  );
};

export default App; -->

<!-- SearchArea.jsx -->

<!--
const SearchArea = ({ value, onChangeFu }) => {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={e => onChangeFu(e.target.value)}
      />
    </div>
  );
};

export default SearchArea; -->

<!-- UsersItem -->

<!-- const UserItem = ({ name }) => {
  return (
    <>
      <li>
        <p>{name}</p>
      </li>
    </>
  );
};

export default UserItem; -->

<!-- UsersList -->

<!-- import UserItem from './UserItem';

const UsersList = ({ arr }) => {
  return (
    <>
      <ul>
        {arr.map(user => (
          <UserItem key={user.id} name={user.name} />
        ))}
      </ul>
    </>
  );
};

export default UsersList; -->

\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

Задача 2: Уникальные ID для задач

Описание: Создайте ToDo-приложение с возможностью добавлять, удалять и
фильтровать задачи. Каждая новая задача должна иметь уникальный идентификатор,
сгенерированный с помощью useId. Используйте map для отображения списка задач и
filter для удаления задач по их ID.

Требования:

useId для генерации уникальных идентификаторов для задач. useState для хранения
списка задач. map для отображения задач и filter для удаления по ID.

Решение :

<!-- App.jsx -->

<!-- import { useState } from 'react';
import ToDoList from './ToDo/ToDoList';
import SearchToDo from './ToDo/SearchToDo';
import AddItem from './ToDo/AddItem';
import { nanoid } from 'nanoid';

const tasks = [
  { id: 1, task: 'Do the laundry' },
  { id: 2, task: 'Buy groceries' },
  { id: 3, task: 'Write the report' },
  { id: 4, task: 'Clean the house' },
  { id: 5, task: 'Prepare dinner' },
];

const App = () => {
  const [toDo, setToDo] = useState(tasks);
  const [searchingWord, setSearchingWord] = useState('');
  const [newTask, setNewTask] = useState('');

  const AddFu = () => {
    setToDo(prev => [...prev, { id: nanoid(), task: newTask }]);
    setNewTask('');
  };

  const deleteFu = id => {
    setToDo(prev => prev.filter(task => task.id !== id));
  };

  const filterArr = toDo.filter(item =>
    item.task.toLowerCase().includes(searchingWord.toLowerCase())
  );

  return (
    <>
      <SearchToDo value={searchingWord} onChangeFu={setSearchingWord} />
      <AddItem addFu={AddFu} value={newTask} onChangeTaskFu={setNewTask} />
      <ToDoList arr={filterArr} deleteFu={deleteFu} />
    </>
  );
};

export default App; -->

<!-- AddItem.jsx -->

<!-- const AddItem = ({ addFu, value, onChangeTaskFu }) => {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => onChangeTaskFu(e.target.value)}
      />
      <button onClick={() => addFu()}>Add</button>
    </>
  );
};

export default AddItem; -->

<!-- SearchToDo.jsx -->
<!--
const SearchToDo = ({ value, onChangeFu }) => {
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => onChangeFu(e.target.value)}
      />
    </>
  );
};

export default SearchToDo; -->

<!-- ToDoItem.jsx -->
<!--
const ToDoItem = ({ text, id, deleteFu }) => {
  return (
    <>
      <li>
        <p>{text}</p>
        <button onClick={() => deleteFu(id)}>Delete</button>
      </li>
    </>
  );
};

export default ToDoItem; -->

<!-- ToDoList.jsx -->

<!-- import ToDoItem from './ToDoItem';

const ToDoList = ({ arr, deleteFu }) => {
  return (
    <div>
      <ul>
        {arr.map(task => (
          <ToDoItem
            key={task.id}
            text={task.task}
            id={task.id}
            deleteFu={deleteFu}
          />
        ))}
      </ul>
    </div>
  );
};

export default ToDoList; -->

Задача 3: Управление состоянием списка с эффектами

Описание: Создайте компонент, который позволяет пользователям добавлять элементы
в список. Список должен сохраняться в localStorage, а также отображать только
элементы, добавленные в течение последнего часа (используйте useEffect для
работы с временем).

Требования:

useState для хранения списка элементов. useEffect для фильтрации элементов по
времени. Используйте filter для отображения только элементов, созданных за
последний час.

Задача 4: Динамическая фильтрация и генерация ID

Описание: Создайте компонент, который отображает динамически фильтруемый список
продуктов. Каждый продукт имеет категорию (например, «фрукты», «овощи»,
«напитки»). Добавьте выпадающее меню для выбора категории. Список продуктов
должен фильтроваться в зависимости от выбранной категории.

Требования:

useState для хранения продуктов и выбранной категории. useId для создания
уникальных идентификаторов продуктов. Используйте filter для фильтрации списка
по категории. map для отображения продуктов.

Решение :

<!-- App.jsx -->

<!-- import { useState } from 'react';
import ProductsList from './ProductsList/ProductsList';
import SelectProductArea from './ProductsList/SelectProductArea';

const products = [
  { id: '1', name: 'Apple', category: 'Fruits' },
  { id: '2', name: 'Carrot', category: 'Vegetables' },
  { id: '3', name: 'Orange Juice', category: 'Drinks' },
  { id: '4', name: 'Banana', category: 'Fruits' },
  { id: '5', name: 'Broccoli', category: 'Vegetables' },
  { id: '6', name: 'Milk', category: 'Drinks' },
  { id: '7', name: 'Strawberry', category: 'Fruits' },
  { id: '8', name: 'Lettuce', category: 'Vegetables' },
  { id: '9', name: 'Soda', category: 'Drinks' },
];

const App = () => {
  const [productsList, setProductsList] = useState(products);
  const [selectCategory, setSelectCategory] = useState('');

  const filterArr = selectCategory
    ? productsList.filter(
        item => item.category.toLowerCase() === selectCategory.toLowerCase()
      )
    : productsList;

  return (
    <>
      <SelectProductArea onChangeFu={setSelectCategory} />
      <ProductsList arr={filterArr} />
    </>
  );
};

export default App; -->

<!-- ProductsList.jsx -->

<!-- import ProductListItem from './ProductListItem';

const ProductsList = ({ arr }) => {
  return (
    <ul>
      {arr.map(item => (
        <ProductListItem
          key={item.id}
          category={item.category}
          product={item.name}
        />
      ))}
    </ul>
  );
};

export default ProductsList; -->

<!-- ProductListItem.jsx -->

<!-- const ProductListItem = ({ product, category }) => {
  return (
    <li>
      <p>Category: {category}</p>
      <p>Product: {product}</p>
    </li>
  );
};

export default ProductListItem; -->

<!-- SelectproductArea.jsx -->
<!--
const SelectProductArea = ({ onChangeFu }) => {
  return (
    <div>
      <p>Select products :</p>
      <select name="products" onChange={e => onChangeFu(e.target.value)}>
        <option value="fruits">Fruits</option>
        <option value="drinks">Drinks</option>
        <option value="vegetables">Vegetables</option>
      </select>
    </div>
  );
};

export default SelectProductArea; -->

Задача 5: Таймер обновления данных

Описание: Создайте компонент, который отображает список постов, обновляемый
каждые 10 секунд. Используйте useEffect для имитации получения данных с сервера.
При каждом обновлении данные должны быть фильтрованы по длине заголовка
(например, только те, что короче 20 символов).

Требования:

useState для хранения списка постов. useEffect для обновления данных каждые 10
секунд. Используйте filter для отображения постов, заголовки которых короче 20
символов. map для отображения отфильтрованных постов. Эти задачи помогут вам
освоить комбинирование разных хуков и методов.
