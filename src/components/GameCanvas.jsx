import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Асинхроннаяneo initialization для совместимости с React
    const initApp = async () => {
      // Создаем приложение PixiJS с использованием нового API
      const app = new PIXI.Application();
      await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0x1099bb,
      });

      // Привязываем канвас к DOM
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas);
      }

      // Создаем круг
      const circle = new PIXI.Graphics();
      circle.beginFill(0xff0000);
      circle.drawCircle(0, 0, 50);
      circle.endFill();
      circle.x = 400; // Начальная позиция X
      circle.y = 300; // Начальная позиция Y

      // Делаем круг интерактивным
      circle.eventMode = 'static'; // Замена interactive в v8
      circle.cursor = 'pointer'; // Замена buttonMode в v8

      // Переменные для свайпа
      let isDragging = false;
      let startX, startY;

      // Обработка начала касания
      circle.on('touchstart', event => {
        event.preventDefault();
        const touchData = event.data.getLocalPosition(app.stage);
        startX = touchData.x - circle.x;
        startY = touchData.y - circle.y;
        isDragging = true;
      });

      // Обработка движения пальца
      circle.on('touchmove', event => {
        event.preventDefault();
        if (isDragging) {
          const touchData = event.data.getLocalPosition(app.stage);
          circle.x = touchData.x - startX;
          circle.y = touchData.y - startY;

          // Ограничиваем движение внутри экрана
          circle.x = Math.max(50, Math.min(app.screen.width - 50, circle.x));
          circle.y = Math.max(50, Math.min(app.screen.height - 50, circle.y));
        }
      });

      // Обработка конца касания
      circle.on('touchend', () => {
        isDragging = false;
      });

      // Добавляем круг на сцену
      app.stage.addChild(circle);
    };

    // Запускаем инициализацию
    initApp();

    // Очистка при размонтировании компонента не требуется вручную в v8,
    // так как PixiJS теперь автоматически управляет ресурсами
  }, []);

  return <div ref={canvasRef} />;
};

export default GameCanvas;
