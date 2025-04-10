import { Application, Sprite } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

const Test = () => {
  const app = new Application({ width: 800, height: 600 });
  document.body.appendChild(app.canvas);

  const sprite = new Sprite.from('path/to/image.png');
  sprite.x = 400;
  sprite.y = 300;
  sprite.width = 100;
  sprite.height = 100;
  sprite.filters = [
    new GlowFilter({ distance: 50, outerStrength: 5, color: 0xff0000 }),
  ];
  app.stage.addChild(sprite);

  return <div></div>;
};

export default Test;
