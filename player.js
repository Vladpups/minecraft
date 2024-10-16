class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40; // Ширина после сжатия
    this.height = 80; // Высота после сжатия
    this.velY = 0;
    this.velX = 0;
    this.speed = 1.7; // Исправлено: дробное значение скорости
    this.jumpStrength = 10;
    this.isJumping = false;
    this.isGrounded = false;
    this.health = 20;
    this.hunger = 20;

    // Загрузка отдельных изображений для каждого кадра анимации
    this.playerSprites = [
      this.loadImage('textures/Player_walk_0.png'),
      this.loadImage('textures/Player_walk_1.png'),
      this.loadImage('textures/Player_walk_2.png'),
      this.loadImage('textures/Player_walk_3.png'),
    ];

    this.frameIndex = 0;
    this.tickCount = 0;
    this.ticksPerFrame = 5; // Скорость переключения кадров
    this.numberOfFrames = this.playerSprites.length; // Количество кадров
    this.facing = 'right'; // Направление взгляда

    this.selectedHotbarSlot = 4; // Начальный выбранный слот
  }

  // Функция для загрузки изображения
  loadImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      console.log(`${src} загружен.`);
    };
    img.onerror = () => {
      console.error(`Не удалось загрузить изображение: ${src}`);
    };
    return img;
  }

  update() {
    // Гравитация
    if (!this.isGrounded) {
      this.velY += gravity;
    } else {
      this.velY = 0;
    }

    // Движение по X
    this.x += this.velX;

    // Проверка коллизий по X
    if (this.collideWithBlocks(this.velX, 0)) {
      this.x -= this.velX;
    }

    // Движение по Y
    this.y += this.velY;

    // Проверка коллизий по Y
    if (this.collideWithBlocks(0, this.velY)) {
      this.y -= this.velY;
      this.isGrounded = true;
      this.isJumping = false;
    } else {
      this.isGrounded = false;
    }

    // Ограничения по границам мира
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > worldWidth * blockSize) {
      this.x = worldWidth * blockSize - this.width;
    }
    if (this.y + this.height > worldHeight * blockSize) {
      this.y = worldHeight * blockSize - this.height;
      this.isGrounded = true;
      this.isJumping = false;
    }

    // Анимация
    if (this.velX !== 0) {
      this.tickCount++;
      if (this.tickCount > this.ticksPerFrame) {
        this.tickCount = 0;
        this.frameIndex = (this.frameIndex + 1) % this.numberOfFrames;
      }
    } else {
      this.frameIndex = 0; // Статичный кадр при остановке
    }
  }

  draw(camera) {
    if (!ctx) {
      console.error('Контекст канваса не определён.');
      return;
    }

    // Текущее изображение для отрисовки
    const currentSprite = this.playerSprites[this.frameIndex];

    // Рисование спрайта с учётом направления
    if (this.facing === 'left') {
      ctx.save();
      ctx.scale(-1, 1); // Отражаем по горизонтали
      ctx.drawImage(
        currentSprite,
        0, 0, this.width, this.height, // Размеры изображения
        -(this.x + this.width) + camera.x, this.y - camera.y, // Координаты на канвасе
        this.width, this.height // Ширина и высота для отрисовки
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        currentSprite,
        0, 0, this.width, this.height, // Размеры изображения
        this.x - camera.x, this.y - camera.y, // Координаты на канвасе
        this.width, this.height // Ширина и высота для отрисовки
      );
    }

    // Отладка
    // console.log(`Player draw: frame ${this.frameIndex}, position (${this.x}, ${this.y})`);
  }

  collideWithBlocks(velX, velY) {
    for (let block of blocks) {
      if (block.isSolid) {
        if (
          this.x + velX < block.x + block.size &&
          this.x + this.width + velX > block.x &&
          this.y + velY < block.y + block.size &&
          this.y + this.height + velY > block.y
        ) {
          return true;
        }
      }
    }
    return false;
  }
}
