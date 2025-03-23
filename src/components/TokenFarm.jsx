import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

const StarEater = () => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const blackHoleRef = useRef(null);
  const coinsRef = useRef([]);
  const tokensRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;

    const handleMove = e => {
      e.preventDefault();
      const app = appRef.current;
      if (!app || !app.canvas) return;
      const rect = app.canvas.getBoundingClientRect();
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

    const initPixi = async () => {
      if (!containerRef.current || !isMounted) return;

      // Инициализация PixiJS v8
      const app = new PIXI.Application();
      await app.init({
        width: Math.min(window.innerWidth - 20, 600),
        height: Math.min((window.innerWidth - 20) * (4 / 3), 800),
        backgroundColor: 0x0f0f1a,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      appRef.current = app;
      containerRef.current.appendChild(app.canvas);

      const width = app.screen.width;
      const height = app.screen.height;

      // Предварительная загрузка текстуры фона
      await PIXI.Assets.load('https://i.imgur.com/0jX8X7S.png');
      const starTexture = PIXI.Texture.from('https://i.imgur.com/0jX8X7S.png');
      const starBackground = new PIXI.TilingSprite({
        texture: starTexture,
        width,
        height,
      });
      starBackground.tileScale.set(0.5);
      app.stage.addChild(starBackground);

      // Черная дыра с градиентом и свечением
      const blackHole = new PIXI.Graphics();
      blackHole.circle(0, 0, 20).fill({
        fill: new PIXI.FillGradient(0, 0, 0, 40)
          .addColorStop(0, 0x000000)
          .addColorStop(1, 0x333333),
      });
      blackHole.x = width / 2;
      blackHole.y = height / 2;
      blackHole.filters = [
        new GlowFilter({ distance: 15, outerStrength: 2, color: 0xffffff }),
      ];
      blackHoleRef.current = blackHole;
      app.stage.addChild(blackHole);

      // Текст для токенов
      const tokensText = new PIXI.Text({
        text: 'Токены: 0',
        style: {
          fontFamily: 'Arial',
          fontSize: 20,
          fill: 0xffffff,
          dropShadow: true,
          dropShadowDistance: 2,
          dropShadowColor: 0x000000,
        },
      });
      tokensText.x = 10;
      tokensText.y = 10;
      app.stage.addChild(tokensText);

      // Добавляем слушатели событий
      app.canvas.addEventListener('mousemove', handleMove);
      app.canvas.addEventListener('touchmove', handleMove, { passive: false });

      // Игровой цикл
      app.ticker.add(delta => {
        const blackHole = blackHoleRef.current;
        const coins = coinsRef.current;
        const deltaTime = delta / 60;

        // Плавное движение черной дыры
        const targetX = Math.max(
          20,
          Math.min(width - 20, lastPosRef.current.x)
        );
        const targetY = Math.max(
          20,
          Math.min(height - 20, lastPosRef.current.y)
        );
        blackHole.x += (targetX - blackHole.x) * 10 * deltaTime;
        blackHole.y += (targetY - blackHole.y) * 10 * deltaTime;

        // Пульсация черной дыры
        blackHole.scale.set(1 + Math.sin(Date.now() / 500) * 0.05);

        // Добавление монет
        if (coins.length < 5 && Math.random() < 0.05) {
          const coin = new PIXI.Graphics();
          coin.circle(0, 0, 5).fill(0xffff00);
          coin.x = Math.random() * width;
          coin.y = Math.random() * height;
          coin.filters = [
            new GlowFilter({ distance: 10, outerStrength: 2, color: 0xffff33 }),
          ];
          coins.push(coin);
          app.stage.addChild(coin);
        }

        // Обработка монет
        let tokensToAdd = 0;
        for (let i = coins.length - 1; i >= 0; i--) {
          const coin = coins[i];
          const dx = blackHole.x - coin.x;
          const dy = blackHole.y - coin.y;
          const distSquared = dx * dx + dy * dy;

          // Притяжение монет
          if (distSquared < 10000) {
            const dist = Math.sqrt(distSquared);
            coin.x += (dx / dist) * 50 * deltaTime;
            coin.y += (dy / dist) * 50 * deltaTime;
          }

          if (distSquared < 400) {
            // 20^2
            app.stage.removeChild(coin);
            coin.destroy();
            coins.splice(i, 1);
            tokensToAdd += 1;

            // Эффект поглощения (частицы)
            for (let j = 0; j < 5; j++) {
              const particle = new PIXI.Graphics();
              particle.circle(0, 0, 2).fill(0xffff00);
              particle.x = coin.x;
              particle.y = coin.y;
              particle.vx = (Math.random() - 0.5) * 50;
              particle.vy = (Math.random() - 0.5) * 50;
              app.stage.addChild(particle);
              const particleTicker = delta => {
                particle.x += particle.vx * deltaTime;
                particle.y += particle.vy * deltaTime;
              };
              app.ticker.add(particleTicker);
              setTimeout(() => {
                app.stage.removeChild(particle);
                particle.destroy();
                app.ticker.remove(particleTicker);
              }, 300);
            }
          }
        }

        if (tokensToAdd > 0) {
          tokensRef.current += tokensToAdd;
          tokensText.text = `Токены: ${tokensRef.current}`;
        }
      });

      lastPosRef.current = { x: width / 2, y: height / 2 };
    };

    initPixi().catch(error =>
      console.error('Ошибка инициализации PixiJS:', error)
    );

    // Очистка при размонтировании
    return () => {
      isMounted = false;
      const app = appRef.current;
      if (app && app.canvas) {
        app.canvas.removeEventListener('mousemove', handleMove);
        app.canvas.removeEventListener('touchmove', handleMove);
        app.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, []);

  const finishGame = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({ tokens: tokensRef.current })
      );
    } else {
      console.log('Tokens:', tokensRef.current);
    }
    tokensRef.current = 0;
    if (blackHoleRef.current && appRef.current) {
      blackHoleRef.current.x = appRef.current.screen.width / 2;
      blackHoleRef.current.y = appRef.current.screen.height / 2;
    }
    coinsRef.current.forEach(coin => {
      appRef.current?.stage.removeChild(coin);
      coin.destroy();
    });
    coinsRef.current = [];
  };

  return (
    <div style={{ background: '#000', color: '#fff', padding: '15px' }}>
      <h2>Пожиратель звёзд</h2>
      <div
        ref={containerRef}
        style={{ border: '1px solid white', touchAction: 'none' }}
      />
      <button onClick={finishGame} style={{ marginTop: '10px' }}>
        Завершить раунд
      </button>
    </div>
  );
};

export default StarEater;
