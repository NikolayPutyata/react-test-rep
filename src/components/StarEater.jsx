import { useEffect, useRef } from 'react';
import { Application, Graphics, Assets, Sprite, Text } from 'pixi.js';

const StarEater = () => {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const blackHoleRef = useRef({ x: 0, y: 0, radius: 20 });
  const coinsRef = useRef([]);
  const tokensRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const tokenTextRef = useRef(null);
  // Новые рефы для эффекта пульсации и цвета
  const pulseScaleRef = useRef(1); // Масштаб для пульсации
  const pulseTimerRef = useRef(0); // Таймер для длительности эффекта
  const strokeColorRef = useRef(0xff00ff); // Цвет обводки (по умолчанию розовый)
  const particlesRef = useRef([]);

  useEffect(() => {
    const initApp = async () => {
      const width = Math.min(window.innerWidth, 500);
      const height = window.innerHeight * 0.9;

      const app = new Application();
      await app.init({
        width,
        height,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });
      appRef.current = app;

      const container = containerRef.current;
      container.appendChild(app.canvas);

      Assets.add({ alias: 'background', src: '/assets/phon.png' });
      await Assets.load('background').then(texture => {
        const background = new Sprite(texture);
        background.width = width;
        background.height = height;
        background.position.set(0, 0);
        app.stage.addChild(background);
      });

      blackHoleRef.current.x = width / 2;
      blackHoleRef.current.y = height / 2;
      lastPosRef.current = { x: width / 2, y: height / 2 };

      const tokenText = new Text({
        text: `${tokensRef.current}`,
        style: {
          fontFamily: 'Arial',
          fontSize: Math.max(16, width * 0.05),
          fill: 0xffffff,
        },
      });
      tokenText.position.set(10, 10);
      app.stage.addChild(tokenText);
      tokenTextRef.current = tokenText;

      const blackHoleGraphics = new Graphics();
      app.stage.addChild(blackHoleGraphics);

      app.stage.interactive = true;
      app.stage.hitArea = app.screen;
      app.stage.on('pointermove', e => {
        const { x, y } = e.data.global;
        lastPosRef.current = { x, y };
      });

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
          coin.circle(0, 0, Math.max(5, width * 0.015));
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

          if (distSquared < 15000) {
            const dist = Math.sqrt(distSquared);
            coin.x += (dx / dist) * 0.5;
            coin.y += (dy / dist) * 0.5;
          }

          if (distSquared < blackHole.radius * blackHole.radius) {
            app.stage.removeChild(coin);
            coins.splice(i, 1);
            tokensToAdd += 1;
            pulseTimerRef.current = 30;
            strokeColorRef.current = 0xffffff;

            // Добавляем частицы
            for (let j = 0; j < 4; j++) {
              const particle = new Graphics();
              particle.x = coin.x;
              particle.y = coin.y;
              particle.fill(0xff00ff);
              particle.circle(0, 0, 2);
              particle.endFill();
              particle.vx = (Math.random() - 0.5) * 4; // Случайная скорость по X
              particle.vy = (Math.random() - 0.5) * 4; // Случайная скорость по Y
              particle.life = 15; // Время жизни частицы в кадрах
              app.stage.addChild(particle);
              particlesRef.current.push(particle);
            }
          }
        }

        if (tokensToAdd > 0) {
          blackHole.radius += 0.5 * tokensToAdd;
          tokensRef.current += tokensToAdd;
          tokenTextRef.current.text = `${tokensRef.current}`;
        }

        // Обновляем эффект пульсации
        if (pulseTimerRef.current > 0) {
          pulseTimerRef.current -= 1;
          // Пульсация: увеличиваем и уменьшаем масштаб
          pulseScaleRef.current =
            1 + 0.05 * Math.sin((pulseTimerRef.current / 10) * Math.PI);
          if (pulseTimerRef.current === 0) {
            pulseScaleRef.current = 1; // Возвращаем нормальный масштаб
            strokeColorRef.current = 0xff00ff; // Возвращаем розовый цвет
          }
        }

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i];
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life -= 1;
          if (particle.life <= 0) {
            app.stage.removeChild(particle);
            particles.splice(i, 1);
          }
        }
        // Отрисовка черной дыры с учетом масштаба и цвета
        blackHoleGraphics.clear();
        blackHoleGraphics
          .stroke({ color: strokeColorRef.current, width: 2 })
          .fill(0x000000)
          .circle(
            blackHole.x,
            blackHole.y,
            blackHole.radius * pulseScaleRef.current
          )
          .endFill();
      });
    };

    initApp();

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
    tokenTextRef.current.text = `${tokensRef.current}`;
  };

  return (
    <div
      style={{
        background: '#000',
        color: '#fff',
        height: '100vh',
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
        GAME
      </h2>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          border: '1px solid white',
          maxWidth: '500px',
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
