// block.js

class Block {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.size = blockSize;
    this.type = type;

    // Определяем, является ли блок твердым
    // Твердые блоки: grass, dirt, sand, sandstone, stone, wood, wood_pine
    // Нерезистентные блоки: leaves, leaves_pine
    const solidBlocks = ['grass', 'dirt', 'sand', 'sandstone', 'stone', 'wood', 'wood_pine'];
    this.isSolid = solidBlocks.includes(type);

    // Определяем путь к спрайту в зависимости от типа
    let spritePath = `assets/blocks/${type}.png`;
    if (type.includes(':')) {
      const [baseType, subtype] = type.split(':');
      spritePath = `assets/blocks/${baseType}_${subtype}.png`;
    }

    this.sprite = new Image();
    this.sprite.src = spritePath;
    this.isSpriteLoaded = false;
    this.sprite.onload = () => {
      this.isSpriteLoaded = true;
    };
    this.sprite.onerror = () => {
      console.error(`Не удалось загрузить спрайт для блока типа ${type}.`);
    };
  }

  draw(camera) {
    if (this.isSpriteLoaded) {
      ctx.drawImage(
        this.sprite,
        this.x - camera.x,
        this.y - camera.y,
        this.size,
        this.size
      );
    } else {
      // Рисуем серый квадрат, если спрайт не загружен
      ctx.fillStyle = '#808080';
      ctx.fillRect(this.x - camera.x, this.y - camera.y, this.size, this.size);
    }
  }
}
