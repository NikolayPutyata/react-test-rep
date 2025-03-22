import { useEffect, useRef } from 'react';
import Konva from 'konva';

const StarEater = () => {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const blackHoleRef = useRef(null);
  const tokensRef = useRef(0);
  const coinsRef = useRef([]);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const width = Math.min(window.innerWidth - 20, 600);
    const height = Math.min(width * (4 / 3), 800);

    const stage = new Konva.Stage({
      container: containerRef.current,
      width,
      height,
    });
    stageRef.current = stage;

    const layer = new Konva.Layer({ hitGraphEnabled: false }); // Отключаем hit graph для скорости
    layerRef.current = layer;
    stage.add(layer);

    // Черная дыра
    const blackHole = new Konva.Circle({
      x: width / 2,
      y: height / 2,
      radius: 20,
      fill: 'black',
      stroke: 'white',
      strokeWidth: 1,
      shadowBlur: 10, // Уменьшено для производительности
      shadowColor: 'rgba(255, 255, 255, 0.5)',
      listening: false, // Отключаем события
    });
    blackHoleRef.current = blackHole;
    layer.add(blackHole);

    // Текст для токенов
    const tokensText = new Konva.Text({
      x: 10,
      y: 10,
      text: 'Токены: 0',
      fontSize: 20,
      fill: 'white',
      listening: false,
    });
    layer.add(tokensText);

    // Обработка движения с интерполяцией
    stage.on('mousemove touchmove', (e) => {
      const pos = stage.getPointerPosition();
      if (pos) {
        lastPosRef.current = { x: pos.x, y: pos.y };
      }
    });

    // Игровой цикл
    const anim = new Konva.Animation((frame) => {
      const blackHole = blackHoleRef.current;
      const coins = coinsRef.current;
      const timeDiff = frame.timeDiff / 1000; // Время между кадрами в секундах

      // Плавное движение черной дыры
      const targetX = Math.max(20, Math.min(width - 20, lastPosRef.current.x));
      const targetY = Math.max(20, Math.min(height - 20, lastPosRef.current.y));
      const lerpFactor = 0.1; // Коэффициент интерполяции
      blackHole.x(blackHole.x() + (targetX - blackHole.x()) * lerpFactor);
      blackHole.y(blackHole.y() + (targetY - blackHole.y()) * lerpFactor);

      // Добавление монет
      if (coins.length < 5 && Math.random() < 0.05) {
        const coin = new Konva.Circle({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 5,
          fill: '#FFFF00',
          stroke: 'yellow',
          strokeWidth: 1,
          shadowBlur: 5, // Уменьшено
          shadowColor: '#FFFF33',
          listening: false,
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

        // Плавное притяжение монет
        if (distSquared < 10000) { // Радиус притяжения
          const dist = Math.sqrt(distSquared);
          coin.x(coin.x() + (dx / dist) * 2 * timeDiff * 60);
          coin.y(coin.y() + (dy / dist) * 2 * timeDiff * 60);
        }

        if (distSquared < radiusSquared) {
          coin.destroy();
          coins.splice(i, 1);
          tokensToAdd += 1;
        }
      }

      if (tokensToAdd > 0) {
        blackHole.radius(blackHole.radius() + 0.5 * tokensToAdd);
        tokensRef.current += tokensToAdd;
        tokensText.text(`Токены: ${tokensRef.current}`);
      }

      layer.batchDraw();
    }, layer);

    anim.start();

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