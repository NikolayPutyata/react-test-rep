import { useEffect, useRef } from 'react';
import Konva from 'konva';

const StarEater = () => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const blackHoleRef = useRef(null);
  const tokensRef = useRef(0);
  const coinsRef = useRef([]);

  useEffect(() => {
    // Инициализация сцены
    const width = Math.min(window.innerWidth - 20, 600);
    const height = Math.min(width * (4 / 3), 800);

    const stage = new Konva.Stage({
      container: containerRef.current,
      width,
      height,
    });
    stageRef.current = stage;

    const layer = new Konva.Layer();
    layerRef.current = layer;
    stage.add(layer);

    // Черная дыра
    const blackHoleRing = new Konva.Ring({
      x: width / 2,
      y: height / 2,
      innerRadius: 15,
      outerRadius: 25,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientColorStops: [0, 'black', 1, 'rgba(255, 255, 255, 0.2)'],
      shadowBlur: 10,
      shadowColor: 'white',
    });

    const blackHoleCircle = new Konva.Circle({
      x: width / 2,
      y: height / 2,
      radius: 20,
      fill: 'black',
      stroke: 'transparent',
      strokeWidth: 2,
      shadowBlur: 30,
      shadowColor: 'rgba(255, 255, 255, 0.8)',
    });

    blackHoleRef.current = blackHoleCircle;
    layer.add(blackHoleRing);
    layer.add(blackHoleCircle);

    // Текст для токенов
    const tokensText = new Konva.Text({
      x: 10,
      y: 10,
      text: 'Токены: 0',
      fontSize: 20,
      fill: 'white',
    });
    layer.add(tokensText);

    // Обработка движения
    stage.on('mousemove touchmove', (e) => {
      const pos = stage.getPointerPosition();
      if (pos) {
        const x = Math.max(20, Math.min(width - 20, pos.x));
        const y = Math.max(20, Math.min(height - 20, pos.y));
        blackHoleCircle.x(x);
        blackHoleCircle.y(y);
        blackHoleRing.x(x);
        blackHoleRing.y(y);
      }
    });

    // Игровой цикл
    const anim = new Konva.Animation(() => {
      const blackHole = blackHoleRef.current;
      const coins = coinsRef.current;

      // Добавление монет
      if (coins.length < 5 && Math.random() < 0.1) {
        const coin = new Konva.Circle({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 5,
          stroke: 'yellow',
          strokeWidth: 2,
          fill: '#FFFF00',
          shadowBlur: 18,
          shadowColor: '#FFFF33',
        });
        coins.push(coin);
        layer.add(coin);
      }

      // Обработка столкновений
      let tokensToAdd = 0;
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const dx = blackHole.x() - coin.x();
        const dy = blackHole.y() - coin.y();
        const distSquared = dx * dx + dy * dy;
        const radiusSquared = blackHole.radius() * blackHole.radius();

        if (distSquared < radiusSquared) {
          coin.destroy();
          coins.splice(i, 1);
          tokensToAdd += 1;
        }
      }

      if (tokensToAdd > 0) {
        const newRadius = blackHole.radius() + 0.5 * tokensToAdd;
        blackHole.radius(newRadius);
        blackHoleRing.innerRadius(newRadius - 5);
        blackHoleRing.outerRadius(newRadius + 5);
        tokensRef.current += tokensToAdd;
        tokensText.text(`Токены: ${tokensRef.current}`);
      }

      layer.batchDraw();
    }, layer);

    anim.start();

    // Очистка
    return () => {
      anim.stop();
      stage.destroy();
    };
  }, []);

  const finishGame = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({ tokens: tokensRef.current }));
    } else {
      console.log('Tokens:', tokensRef.current);
    }
    tokensRef.current = 0;
    blackHoleRef.current.radius(20);
    blackHoleRef.current.x(stageRef.current.width() / 2);
    blackHoleRef.current.y(stageRef.current.height() / 2);
    coinsRef.current.forEach((coin) => coin.destroy());
    coinsRef.current = [];
    layerRef.current.batchDraw();
  };

  return (
    <div style={{ background: '#000', color: '#fff', padding: '15px' }}>
      <h2>Пожиратель звёзд</h2>
      <div ref={containerRef} style={{ border: '1px solid white' }} />
      <button onClick={finishGame} style={{ marginTop: '10px' }}>
        Завершить раунд
      </button>
    </div>
  );
};

export default StarEater;