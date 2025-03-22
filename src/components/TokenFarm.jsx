import { useEffect, useRef } from 'react';

const StarEater = () => {
  const canvasRef = useRef(null);
  const blackHoleRef = useRef({ x: 300, y: 400, radius: 20 });
  const coinsRef = useRef([]);
  const tokensRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = Math.min(window.innerWidth - 20, 600);
    const height = Math.min(width * (4 / 3), 800);
    canvas.width = width;
    canvas.height = height;

    blackHoleRef.current.x = width / 2;
    blackHoleRef.current.y = height / 2;
    lastPosRef.current = { x: width / 2, y: height / 2 };

    const handleMove = (e) => {
      e.preventDefault(); // Предотвращаем прокрутку страницы
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if (e.type === 'mousemove') {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else if (e.type === 'touchmove') {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      }
      lastPosRef.current = { x, y };
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false }); // passive: false для preventDefault

    const gameLoop = () => {
      const blackHole = blackHoleRef.current;
      const coins = coinsRef.current;

      // Плавное движение черной дыры
      const targetX = Math.max(20, Math.min(width - 20, lastPosRef.current.x));
      const targetY = Math.max(20, Math.min(height - 20, lastPosRef.current.y));
      blackHole.x += (targetX - blackHole.x) * 0.1;
      blackHole.y += (targetY - blackHole.y) * 0.1;

      // Добавление монет
      if (coins.length < 5 && Math.random() < 0.05) {
        coins.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 5,
        });
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
          coins.splice(i, 1);
          tokensToAdd += 1;
        }
      }

      if (tokensToAdd > 0) {
        blackHole.radius += 0.5 * tokensToAdd;
        tokensRef.current += tokensToAdd;
      }

      // Рендеринг
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Токены: ${tokensRef.current}`, 10, 30);

      ctx.beginPath();
      ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();

      coins.forEach((coin) => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFF00';
        ctx.fill();
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
      });

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
    };
  }, []);

  const finishGame = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({ tokens: tokensRef.current }));
    } else {
      console.log('Tokens:', tokensRef.current);
    }
    tokensRef.current = 0;
    blackHoleRef.current = { x: canvasRef.current.width / 2, y: canvasRef.current.height / 2, radius: 20 };
    coinsRef.current = [];
  };

  return (
    <div style={{ background: '#000', color: '#fff', padding: '15px' }}>
      <h2>Пожиратель звёзд</h2>
      <canvas ref={canvasRef}
        style={{ border: '1px solid white', touchAction: 'none' }} // Предотвращаем прокрутку через CSS
      />
      <button onClick={finishGame} style={{ marginTop: '10px' }}>
        Завершить раунд
      </button>
    </div>
  );
};

export default StarEater;