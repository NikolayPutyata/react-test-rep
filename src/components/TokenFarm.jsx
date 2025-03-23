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
    // Инициализация PixiJS
    const width = Math.min(window.innerWidth - 20, 600);
    const height = Math.min(width * (4 / 3), 800);
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x0f0f1a, // Тёмный фон
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    appRef.current = app;
    containerRef.current.appendChild(app.view);

    // Статичный фон со звёздами
    const starTexture = PIXI.Texture.from('https://i.imgur.com/0jX8X7S.png'); // Текстура звёзд (замените на свою)
    const starBackground = new PIXI.TilingSprite(starTexture, width, height);
    starBackground.tileScale.set(0.5); // Масштаб звёзд
    app.stage.addChild(starBackground);

    // Черная дыра с градиентом и свечением
    const blackHole = new PIXI.Graphics();
    const gradient = new PIXI.FillGradient(0, 0, 0, 40);
    gradient.addColorStop(0, 0x000000);
    gradient.addColorStop(1, 0x333333);
    blackHole.beginFill(gradient);
    blackHole.drawCircle(0, 0, 20);
    blackHole.endFill();
    blackHole.x = width / 2;
    blackHole.y = height / 2;
    blackHole.filters = [
      new GlowFilter({ distance: 15, outerStrength: 2, color: 0xffffff }),
    ];
    blackHoleRef.current = blackHole;
    app.stage.addChild(blackHole);

    // Текст для токенов
    const tokensText = new PIXI.Text('Токены: 0', {
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowDistance: 2,
      dropShadowColor: 0x000000,
    });
    tokensText.x = 10;
    tokensText.y = 10;
    app.stage.addChild(tokensText);

    // Обработка движения
    app.view.addEventListener('mousemove', e => {
      const rect = app.view.getBoundingClientRect();
      lastPosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    });
    app.view.addEventListener(
      'touchmove',
      e => {
        e.preventDefault();
        const rect = app.view.getBoundingClientRect();
        lastPosRef.current = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      },
      { passive: false }
    );

    // Игровой цикл
    app.ticker.add(delta => {
      const blackHole = blackHoleRef.current;
      const coins = coinsRef.current;
      const deltaTime = delta / 60; // Нормализация к 60 FPS

      // Плавное движение черной дыры
      const targetX = Math.max(20, Math.min(width - 20, lastPosRef.current.x));
      const targetY = Math.max(20, Math.min(height - 20, lastPosRef.current.y));
      blackHole.x += (targetX - blackHole.x) * 10 * deltaTime;
      blackHole.y += (targetY - blackHole.y) * 10 * deltaTime;

      // Пульсация черной дыры
      blackHole.scale.set(1 + Math.sin(Date.now() / 500) * 0.05);

      // Добавление монет
      if (coins.length < 5 && Math.random() < 0.05) {
        const coin = new PIXI.Graphics();
        coin.beginFill(0xffff00);
        coin.drawCircle(0, 0, 5);
        coin.endFill();
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
            particle.beginFill(0xffff00);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            particle.x = coin.x;
            particle.y = coin.y;
            particle.vx = (Math.random() - 0.5) * 50;
            particle.vy = (Math.random() - 0.5) * 50;
            app.stage.addChild(particle);
            setTimeout(() => {
              app.stage.removeChild(particle);
              particle.destroy();
            }, 300);
            app.ticker.add(delta => {
              particle.x += particle.vx * deltaTime;
              particle.y += particle.vy * deltaTime;
            });
          }
        }
      }

      if (tokensToAdd > 0) {
        tokensRef.current += tokensToAdd;
        tokensText.text = `Токены: ${tokensRef.current}`;
      }
    });

    lastPosRef.current = { x: width / 2, y: height / 2 };

    return () => {
      app.destroy(true);
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
    blackHoleRef.current.x = appRef.current.screen.width / 2;
    blackHoleRef.current.y = appRef.current.screen.height / 2;
    coinsRef.current.forEach(coin => {
      appRef.current.stage.removeChild(coin);
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
