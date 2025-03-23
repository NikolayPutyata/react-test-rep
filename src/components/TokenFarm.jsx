import { useEffect, useRef } from 'react';

const StarEater = () => {
  const canvasRef = useRef(null);
  const blackHoleRef = useRef({ x: 0, y: 0, radius: 20 });
  const coinsRef = useRef([]);
  const tokensRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const width = Math.min(window.innerWidth - 20, 600);
    const height = Math.min(width * (4 / 3), 800);
    canvas.width = width;
    canvas.height = height;

    blackHoleRef.current.x = width / 2;
    blackHoleRef.current.y = height / 2;
    lastPosRef.current = { x: width / 2, y: height / 2 };

    // Статичный фон (рендерится один раз)
    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, '#1a1a2e'); // Тёмно-синий верх
    background.addColorStop(1, '#0f0f1a'); // Ещё темнее низ
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const handleMove = (e) => {
      e.preventDefault();
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
    canvas.addEventListener('touchmove', handleMove, { passive: false });

    const gameLoop = (time) => {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const blackHole = blackHoleRef.current;
      const coins = coinsRef.current;

      // Плавное движение черной дыры
      const targetX = Math.max(20, Math.min(width - 20, lastPosRef.current.x));
      const targetY = Math.max(20, Math.min(height - 20, lastPosRef.current.y));
      const speed = 10;
      blackHole.x += (targetX - blackHole.x) * speed * deltaTime;
      blackHole.y += (targetY - blackHole.y) * speed * deltaTime;

      // Добавление монет
      if (coins.length < 5 && Math.random() < 0.05) {
        coins.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 5,
        });
      }

      // Обработка монет
      let tokensToAdd = 0;
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const dx = blackHole.x - coin.x;
        const dy = blackHole.y - coin.y;
        const distSquared = dx * dx + dy * dy;

        if (distSquared < 10000) {
          const dist = Math.sqrt(distSquared);
          const pullSpeed = 50 * deltaTime;
          coin.x += (dx / dist) * pullSpeed;
          coin.y += (dy / dist) * pullSpeed;
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

      // Очистка только изменённых областей
      ctx.fillStyle = '#0f0f1a'; // Цвет нижней части градиента для упрощения
      ctx.fillRect(0, 0, width, 40); // Область текста
      coins.forEach((coin) => {
        const r = coin.radius + 2; // Без тени, только радиус + обводка
        ctx.fillRect(coin.x - r, coin.y - r, r * 2, r * 2);
      });
      const bhR = blackHole.radius + 20; // Учитываем тень черной дыры
      ctx.fillRect(blackHole.x - bhR, blackHole.y - bhR, bhR * 2, bhR * 2);

      // Рендеринг текста
      ctx.font = '20px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Токены: ${tokensRef.current}`, 10, 30);

      // Рендеринг черной дыры с тенью и пульсацией
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      const pulse = Math.sin(time / 500) * 2;
      ctx.arc(blackHole.x, blackHole.y, blackHole.radius + pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Рендеринг монет без тени
      ctx.shadowBlur = 0; // Отключаем тень для монет
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
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid white', touchAction: 'none' }}
      />
      <button onClick={finishGame} style={{ marginTop: '10px' }}>
        Завершить раунд
      </button>
    </div>
  );
};

export default StarEater;