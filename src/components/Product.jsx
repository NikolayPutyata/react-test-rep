export default function Product(props) {
  const price = 999;
  const url =
    'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?dpr=2&h=480&w=640';

  return (
    <div>
      <h2>Tacos</h2>
      <img src={url} alt="Tacos With Lime" width="340" />
      <p>Price: {price} credits</p>
      <p>Name: {props.name}</p>
    </div>
  );
}
