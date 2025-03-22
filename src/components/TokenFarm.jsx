import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Ring } from 'react-konva';

const StarEater = () => {
  const [tokens, setTokens] = useState(0);
  const [stageSize, setStageSize] = useState({
    width: Math.min(window.innerWidth - 20, 600),
    height: Math.min((window.innerWidth - 20) * (4 / 3), 800),
  });
  const blackHoleRef = useRef({ x: 150, y: 200, radius: 20 });
  const coinsRef = useRef([]);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const animationFrameId = useRef(null);

  // Обновление размеров
  useEffect(() => {
    const updateSize = () => {
      const newWidth = Math.min(window.innerWidth - 20, 600);
      const newHeight = Math.min(newWidth * (4 / 3), 800);
      setStageSize({ width: newWidth, height: newHeight });
      blackHoleRef.current.x = newWidth / 2;
      blackHoleRef.current.y = newHeight / 2;
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Игровой цикл
  useEffect(() => {
    const gameLoop = () => {
      const blackHole = blackHoleRef.current;
      const coins = coinsRef.current;

      // Добавление новой монеты
      if (coins.length < 5 && Math.random() < 0.1) {
        coins.push({
          x: Math.random() * stageSize.width,
          y: Math.random() * stageSize.height,
          radius: 5,
          id: Date.now(),
        });
      }

      // Обработка монет
      let tokensToAdd = 0;
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const dx = blackHole.x - coin.x;
        const dy = blackHole.y - coin.y;
        const distSquared = dx * dx + dy * dy;
        const radiusSquared = blackHole.radius * blackHole.radius;

        if (distSquared < radiusSquared) {
          coins.splice(i, 1);
          tokensToAdd += 1;
        }
      }

      if (tokensToAdd > 0) {
        blackHole.radius += 0.5 * tokensToAdd;
        setTokens((prev) => prev + tokensToAdd);
      }

      // Обновление слоя
      layerRef.current?.batchDraw();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [stageSize]);

  // Управление движением
  const handleMove = (e) => {
    const stage = stageRef.current.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      blackHoleRef.current.x = Math.max(
        blackHoleRef.current.radius,
        Math.min(stageSize.width - blackHoleRef.current.radius, pos.x)
      );
      blackHoleRef.current.y = Math.max(
        blackHoleRef.current.radius,
        Math.min(stageSize.height - blackHoleRef.current.radius, pos.y)
      );
    }
  };

  const finishGame = () => {
    window.Telegram.WebApp.sendData(JSON.stringify({ tokens }));
    setTokens(0);
    blackHoleRef.current = { x: stageSize.width / 2, y: stageSize.height / 2, radius: 20 };
    coinsRef.current = [];
  };

  return (
    <div style={{ background: '#000', color: '#fff', padding: '15px' }}>
      <h2>Пожиратель звёзд</h2>
      <p>Токены: {tokens}</p>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onTouchMove={handleMove}
        onMouseMove={handleMove}
        ref={stageRef}
        style={{ border: '1px solid transparent' }}
      >
        <Layer ref={layerRef}>
          <Ring
            x={blackHoleRef.current.x}
            y={blackHoleRef.current.y}
            innerRadius={blackHoleRef.current.radius - 5}
            outerRadius={blackHoleRef.current.radius + 5}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientColorStops={[0, 'black', 1, 'rgba(255, 255, 255, 0.2)']}
            shadowBlur={10}
            shadowColor="white"
          />
          <Circle
            x={blackHoleRef.current.x}
            y={blackHoleRef.current.y}
            radius={blackHoleRef.current.radius}
            fill="black"
            stroke="transparent"
            strokeWidth={2}
            shadowBlur={30}
            shadowColor="rgba(255, 255, 255, 0.8)"
          />
          {coinsRef.current.map((coin) => (
            <Circle
              key={coin.id}
              x={coin.x}
              y={coin.y}
              radius={coin.radius}
              stroke="yellow"
              strokeWidth={2}
              fill="#FFFF00"
              shadowBlur={18}
              shadowColor="#FFFF33"
            />
          ))}
        </Layer>
      </Stage>
      <button onClick={finishGame} style={{ marginTop: '10px' }}>
        Завершить раунд
      </button>
    </div>
  );
};

export default StarEater;