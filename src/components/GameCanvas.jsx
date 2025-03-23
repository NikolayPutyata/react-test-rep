import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const initApp = async () => {
      // Создаем приложение PixiJS
      const app = new PIXI.Application();
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
      });

      // Привязываем канвас к DOM
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
        app.canvas.style.touchAction = 'none';
      }

      // Создаем круг
      const circle = new PIXI.Graphics();
      circle.fill(0xff0000);
      circle.circle(0, 0, 50);
      circle.endFill();
      circle.x = 400; // Начальная позиция X
      circle.y = 300; // Начальная позиция Y

      // Делаем круг интерактивным
      circle.eventMode = 'static';
      circle.cursor = 'pointer';

      // Переменная для отслеживания перетаскивания
      let isDragging = false;

      // Обработка начала касания
      circle.on('touchstart', () => {
        isDragging = true;
        // Не нужно вычислять смещение здесь
      });

      // Обработка движения пальца
      circle.on('touchmove', event => {
        if (isDragging) {
          const touchData = event.getLocalPosition(app.stage);
          // Устанавливаем позицию круга прямо под пальцем
          circle.x = touchData.x;
          circle.y = touchData.y;

          // Ограничиваем движение внутри экрана
          circle.x = Math.max(50, Math.min(app.screen.width - 50, circle.x));
          circle.y = Math.max(50, Math.min(app.screen.height - 50, circle.y));
        }
      });

      // Обработка конца касания
      circle.on('touchend', () => {
        isDragging = false;
      });

      // Обработка отмены касания (для надежности)
      circle.on('touchcancel', () => {
        isDragging = false;
      });

      // Добавляем круг на сцену
      app.stage.addChild(circle);
    };

    // Запускаем инициализацию
    initApp();
  }, []);

  return <div ref={canvasRef} />;
};

export default GameCanvas;
