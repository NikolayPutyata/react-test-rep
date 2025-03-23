// import { useEffect, useRef } from 'react';

// const StarEater = () => {
//   const canvasRef = useRef(null);
//   const blackHoleRef = useRef({ x: 300, y: 400, radius: 20 });
//   const coinsRef = useRef([]);
//   const tokensRef = useRef(0);
//   const lastPosRef = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const width = Math.min(window.innerWidth - 20, 600);
//     const height = Math.min(width * (4 / 3), 800);
//     canvas.width = width;
//     canvas.height = height;

//     blackHoleRef.current.x = width / 2;
//     blackHoleRef.current.y = height / 2;
//     lastPosRef.current = { x: width / 2, y: height / 2 };

//     const handleMove = e => {
//       e.preventDefault(); // Предотвращаем прокрутку страницы
//       const rect = canvas.getBoundingClientRect();
//       let x, y;
//       if (e.type === 'mousemove') {
//         x = e.clientX - rect.left;
//         y = e.clientY - rect.top;
//       } else if (e.type === 'touchmove') {
//         x = e.touches[0].clientX - rect.left;
//         y = e.touches[0].clientY - rect.top;
//       }
//       lastPosRef.current = { x, y };
//     };

//     canvas.addEventListener('mousemove', handleMove);
//     canvas.addEventListener('touchmove', handleMove, { passive: false }); // passive: false для preventDefault

//     const gameLoop = () => {
//       const blackHole = blackHoleRef.current;
//       const coins = coinsRef.current;

//       // Плавное движение черной дыры
//       const targetX = Math.max(20, Math.min(width - 20, lastPosRef.current.x));
//       const targetY = Math.max(20, Math.min(height - 20, lastPosRef.current.y));
//       blackHole.x += (targetX - blackHole.x) * 0.1;
//       blackHole.y += (targetY - blackHole.y) * 0.1;

//       // Добавление монет
//       if (coins.length < 5 && Math.random() < 0.05) {
//         coins.push({
//           x: Math.random() * width,
//           y: Math.random() * height,
//           radius: 5,
//         });
//       }

//       // Обработка столкновений и притяжения
//       let tokensToAdd = 0;
//       for (let i = coins.length - 1; i >= 0; i--) {
//         const coin = coins[i];
//         const dx = blackHole.x - coin.x;
//         const dy = blackHole.y - coin.y;
//         const distSquared = dx * dx + dy * dy;

//         if (distSquared < 10000) {
//           const dist = Math.sqrt(distSquared);
//           coin.x += (dx / dist) * 0.5;
//           coin.y += (dy / dist) * 0.5;
//         }

//         if (distSquared < blackHole.radius * blackHole.radius) {
//           coins.splice(i, 1);
//           tokensToAdd += 1;
//         }
//       }

//       if (tokensToAdd > 0) {
//         blackHole.radius += 0.5 * tokensToAdd;
//         tokensRef.current += tokensToAdd;
//       }

//       // Рендеринг
//       ctx.fillStyle = '#000';
//       ctx.fillRect(0, 0, width, height);

//       ctx.font = '20px Arial';
//       ctx.fillStyle = 'white';
//       ctx.fillText(`Токены: ${tokensRef.current}`, 10, 30);

//       ctx.beginPath();
//       ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
//       ctx.fillStyle = 'black';
//       ctx.fill();
//       ctx.strokeStyle = 'white';
//       ctx.lineWidth = 1;
//       ctx.stroke();

//       coins.forEach(coin => {
//         ctx.beginPath();
//         ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
//         ctx.fillStyle = '#FFFF00';
//         ctx.fill();
//         ctx.strokeStyle = 'yellow';
//         ctx.stroke();
//       });

//       requestAnimationFrame(gameLoop);
//     };

//     requestAnimationFrame(gameLoop);

//     return () => {
//       canvas.removeEventListener('mousemove', handleMove);
//       canvas.removeEventListener('touchmove', handleMove);
//     };
//   }, []);

//   const finishGame = () => {
//     if (window.Telegram?.WebApp) {
//       window.Telegram.WebApp.sendData(
//         JSON.stringify({ tokens: tokensRef.current })
//       );
//     } else {
//       console.log('Tokens:', tokensRef.current);
//     }
//     tokensRef.current = 0;
//     blackHoleRef.current = {
//       x: canvasRef.current.width / 2,
//       y: canvasRef.current.height / 2,
//       radius: 20,
//     };
//     coinsRef.current = [];
//   };

//   return (
//     <div style={{ background: '#000', color: '#fff', padding: '15px' }}>
//       <h2>Пожиратель звёзд</h2>
//       <canvas
//         ref={canvasRef}
//         style={{ border: '1px solid white', touchAction: 'none' }} // Предотвращаем прокрутку через CSS
//       />
//       <button onClick={finishGame} style={{ marginTop: '10px' }}>
//         Завершить раунд
//       </button>
//     </div>
//   );
// };

// export default StarEater;
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
      const height = window.innerHeight * 0.8; // 80% высоты экрана для игрового поля

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
      const tokenText = new Text(`Токены: ${tokensRef.current}`, {
        fontFamily: 'Arial',
        fontSize: Math.max(16, width * 0.05), // Адаптивный размер шрифта
        fill: 0xffffff,
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
          coin.beginFill(0xffff00);
          coin.lineStyle(1, 0xffff00);
          coin.drawCircle(0, 0, Math.max(5, width * 0.015)); // Адаптивный размер монет
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
        blackHoleGraphics.beginFill(0x000000);
        blackHoleGraphics.lineStyle(1, 0xffffff);
        blackHoleGraphics.drawCircle(
          blackHole.x,
          blackHole.y,
          blackHole.radius
        );
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
          margin: '0 auto', // Центрирование
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
