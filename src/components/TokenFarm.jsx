import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Ring } from 'react-konva';

// Вспомогательная функция для дебаунса
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const StarEater = () => {
  const [gameState, setGameState] = useState({
    tokens: 0,
    blackHole: { x: 150, y: 200, radius: 20 },
    coins: [],
    gameOver: false,
  });
  const [stageSize, setStageSize] = useState({
    width: Math.min(window.innerWidth - 20, 600),
    height: Math.min((window.innerWidth - 20) * (4 / 3), 800),
  });
  const stageRef = useRef(null);
  const layerRef = useRef(null);

  // Обновление размеров с дебаунсом
  useEffect(() => {
    const debouncedResize = debounce(() => {
      const newWidth = Math.min(window.innerWidth - 20, 600);
      const newHeight = Math.min(newWidth * (4 / 3), 800);
      setStageSize({ width: newWidth, height: newHeight });
      setGameState(prev => ({
        ...prev,
        blackHole: {
          ...prev.blackHole,
          x: newWidth / 2,
          y: newHeight / 2,
        },
      }));
    }, 100);

    window.addEventListener('resize', debouncedResize);
    debouncedResize();
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // Основной игровой цикл
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        let newCoins = [...prev.coins];
        const { blackHole } = prev;
        let tokensToAdd = 0; // Отслеживаем количество собранных монет вручную

        // Добавление новой монеты
        if (newCoins.length < 5 && Math.random() < 0.1) {
          newCoins.push({
            x: Math.random() * stageSize.width,
            y: Math.random() * stageSize.height,
            radius: 5,
            id: Date.now(),
          });
        }

        // Обработка монет
        newCoins = newCoins
          .map(coin => {
            const dx = blackHole.x - coin.x;
            const dy = blackHole.y - coin.y;
            const distSquared = dx * dx + dy * dy;
            const radiusSquared = blackHole.radius * blackHole.radius;

            if (distSquared < radiusSquared) {
              tokensToAdd += 1; // Увеличиваем счётчик токенов
              return null;
            }
            return coin;
          })
          .filter(Boolean);

        // Обновление состояния
        return {
          ...prev,
          tokens: Math.max(0, prev.tokens + tokensToAdd), // Защита от отрицательных значений
          blackHole:
            tokensToAdd > 0
              ? {
                  ...blackHole,
                  radius: blackHole.radius + 0.5 * tokensToAdd,
                }
              : blackHole,
          coins: newCoins,
        };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [stageSize]);

  // Обработка движения с дебаунсом
  const handleMove = debounce(() => {
    const stage = stageRef.current.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      setGameState(prev => ({
        ...prev,
        blackHole: {
          ...prev.blackHole,
          x: Math.max(
            prev.blackHole.radius,
            Math.min(stageSize.width - prev.blackHole.radius, pos.x)
          ),
          y: Math.max(
            prev.blackHole.radius,
            Math.min(stageSize.height - prev.blackHole.radius, pos.y)
          ),
        },
      }));
    }
  }, 16);

  const finishGame = () => {
    window.Telegram.WebApp.sendData(
      JSON.stringify({ tokens: gameState.tokens })
    );
    setGameState({
      tokens: 0, // Явный сброс на 0
      blackHole: {
        x: stageSize.width / 2,
        y: stageSize.height / 2,
        radius: 20,
      },
      coins: [],
      gameOver: false,
    });
  };

  return (
    <div style={{ background: '#000', color: '#fff', padding: '15px' }}>
      <h2>Пожиратель звёзд</h2>
      <p>Токены: {gameState.tokens}</p>
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
            x={gameState.blackHole.x}
            y={gameState.blackHole.y}
            innerRadius={gameState.blackHole.radius - 5}
            outerRadius={gameState.blackHole.radius + 5}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientColorStops={[
              0,
              'black',
              1,
              'rgba(255, 255, 255, 0.2)',
            ]}
            shadowBlur={10}
            shadowColor="white"
          />
          <Circle
            x={gameState.blackHole.x}
            y={gameState.blackHole.y}
            radius={gameState.blackHole.radius}
            fill="black"
            stroke="transparent"
            strokeWidth={2}
            shadowBlur={30} // Увеличенное размытие тени
            shadowColor="rgba(255, 255, 255, 0.8)" // Более выраженная тень
            shadowOffset={{ x: 0, y: 0 }} // Без смещения
          />

          {gameState.coins.map(coin => (
            <Circle
              key={coin.id}
              x={coin.x}
              y={coin.y}
              radius={coin.radius}
              stroke="yellow"
              strokeWidth={2}
              fill="#FFFF00" // Ярко-желтый цвет
              shadowBlur={18} // Увеличенная тень
              shadowColor="#FFFF33" // Еще более яркий желтый для тени
            />
          ))}
        </Layer>
      </Stage>
      {gameState.gameOver && (
        <button onClick={finishGame} style={{ marginTop: '10px' }}>
          Завершить раунд
        </button>
      )}
    </div>
  );
};

export default StarEater;
