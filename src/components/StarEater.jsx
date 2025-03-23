import { useEffect, useRef } from 'react';
import { Application, Graphics, Text } from 'pixi.js';

const StarEater = () => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const blackHoleRef = useRef({ x: 0, y: 0, radius: 20 });
  const coinsRef = useRef([]);
  const tokensRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const tokenTextRef = useRef(null);

  useEffect(() => {
    const initApp = async () => {
      // Определяем размеры для мобильных устройств
      const width = Math.min(window.innerWidth, 500); // Ограничиваем максимальную ширину
      const height = window.innerHeight * 0.95; // 95% высоты экрана для игрового поля

      const app = new Application();
      await app.init({
        width,
        height,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true, // Сглаживание для лучшего вида на мобильных
      });
      appRef.current = app;

      // Добавляем канвас в DOM
      const container = containerRef.current;
      container.appendChild(app.canvas);

      // Центрируем черную дыру
      blackHoleRef.current.x = width / 2;
      blackHoleRef.current.y = height / 2;
      lastPosRef.current = { x: width / 2, y: height / 2 };

      // Текст с токенами
      const tokenText = new Text({
        text: `Токены: ${tokensRef.current}`,
        style: {
          fontFamily: 'Arial',
          fontSize: Math.max(16, width * 0.05), // Адаптивный размер шрифта
          fill: 0xffffff,
        },
      });
      tokenText.position.set(10, 10);
      app.stage.addChild(tokenText);
      tokenTextRef.current = tokenText;

      // Графика черной дыры
      const blackHoleGraphics = new Graphics();
      app.stage.addChild(blackHoleGraphics);

      // Обработка сенсорного ввода
      app.stage.interactive = true;
      app.stage.hitArea = app.screen;
      app.stage.on('pointermove', e => {
        const { x, y } = e.data.global;
        lastPosRef.current = { x, y };
      });

      // Игровой цикл
      app.ticker.add(() => {
        const blackHole = blackHoleRef.current;
        const coins = coinsRef.current;

        // Плавное движение черной дыры
        const targetX = Math.max(
          blackHole.radius,
          Math.min(width - blackHole.radius, lastPosRef.current.x)
        );
        const targetY = Math.max(
          blackHole.radius,
          Math.min(height - blackHole.radius, lastPosRef.current.y)
        );
        blackHole.x += (targetX - blackHole.x) * 0.1;
        blackHole.y += (targetY - blackHole.y) * 0.1;

        // Добавление монет
        if (coins.length < 5 && Math.random() < 0.05) {
          const coin = new Graphics();
          coin.x = Math.random() * (width - 20) + 10;
          coin.y = Math.random() * (height - 20) + 10;
          coin.fill(0xffff00);
          coin.setStrokeStyle(1, 0xffff00);
          coin.circle(0, 0, Math.max(5, width * 0.015)); // Адаптивный размер монет
          coin.endFill();
          app.stage.addChild(coin);
          coins.push(coin);
        }

        // Обработка столкновений и притяжения
        let tokensToAdd = 0;
        for (let i = coins.length - 1; i >= 0; i--) {
          const coin = coins[i];
          const dx = blackHole.x - coin.x;
          const dy = blackHole.y - coin.y;
          const distSquared = dx * dx + dy * dy;

          if (distSquared < 10000) {
            const dist = Math.sqrt(distSquared);
            coin.x += (dx / dist) * 0.5;
            coin.y += (dy / dist) * 0.5;
          }

          if (distSquared < blackHole.radius * blackHole.radius) {
            app.stage.removeChild(coin);
            coins.splice(i, 1);
            tokensToAdd += 1;
          }
        }

        if (tokensToAdd > 0) {
          blackHole.radius += 0.5 * tokensToAdd;
          tokensRef.current += tokensToAdd;
          tokenTextRef.current.text = `Токены: ${tokensRef.current}`;
        }

        // Отрисовка черной дыры
        blackHoleGraphics.clear();
        blackHoleGraphics.setStrokeStyle(1, 0xffffff);
        blackHoleGraphics.circle(blackHole.x, blackHole.y, blackHole.radius);
        blackHoleGraphics.endFill();
      });
    };

    initApp();

    // Очистка при размонтировании
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
        const container = containerRef.current;
        if (container && appRef.current.canvas) {
          container.removeChild(appRef.current.canvas);
        }
      }
    };
  }, []);

  const finishGame = () => {
    if (!appRef.current) return;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({ tokens: tokensRef.current })
      );
    } else {
      console.log('Tokens:', tokensRef.current);
    }
    tokensRef.current = 0;
    blackHoleRef.current = {
      x: appRef.current.screen.width / 2,
      y: appRef.current.screen.height / 2,
      radius: 20,
    };
    coinsRef.current.forEach(coin => appRef.current.stage.removeChild(coin));
    coinsRef.current = [];
    tokenTextRef.current.text = `Токены: ${tokensRef.current}`;
  };

  return (
    <div
      style={{
        background: '#000',
        color: '#fff',
        height: '100vh', // Полная высота экрана
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          margin: '10px 0',
          fontSize: '1.2em',
        }}
      >
        Пожиратель звёзд
      </h2>
      <div
        ref={containerRef}
        style={{
          flex: 1, // Занимает доступное пространство
          border: '1px solid white',
          maxWidth: '500px', // Ограничение ширины
          marginLeft: '20px',
          marginRight: '20px',

          width: '100%',
        }}
      />
      <button
        onClick={finishGame}
        style={{
          margin: '10px auto',
          padding: '10px 20px',
          fontSize: '1em',
          display: 'block',
        }}
      >
        Завершить раунд
      </button>
    </div>
  );
};

export default StarEater;
