// mob.js

class Mob {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = blockSize;
      this.height = blockSize * 2; // Высота моба
      this.speed = 2;
      this.velX = 0;
      this.velY = 0;
      this.isJumping = false;
      this.isGrounded = false;
  
      // Загрузка спрайта моба
      this.spriteSheet = new Image();
      this.spriteSheet.src = 'assets/blocks/mob.png'; // Убедитесь, что спрайт существует
      this.isSpriteLoaded = false;
      this.spriteSheet.onload = () => {
        this.isSpriteLoaded = true;
      };
      this.spriteSheet.onerror = () => {
        console.error('Не удалось загрузить спрайт моба.');
      };
    }
  
    update() {
      // Применение гравитации
      this.velY += gravity;
  
      // Предварительное обновление позиции
      let newX = this.x + this.velX;
      let newY = this.y + this.velY;
  
      // Создание прямоугольника для будущей позиции
      let mobRect = {
        x: newX,
        y: newY,
        width: this.width,
        height: this.height
      };
  
      // Проверка столкновений с блоками
      for (let block of blocks) {
        if (!block.isSolid) continue; // Пропустить не твердые блоки
  
        let blockRect = {
          x: block.x,
          y: block.y,
          width: block.size,
          height: block.size
        };
  
        if (isColliding(mobRect, blockRect)) {
          // Разрешение столкновений по вертикали и горизонтали
          if (this.velY > 0) {
            // Столкновение снизу блока (моб приземляется)
            newY = block.y - this.height;
            this.velY = 0;
            this.isGrounded = true;
            this.isJumping = false;
          } else if (this.velY < 0) {
            // Столкновение сверху блока (моб ударяется головой)
            newY = block.y + block.size;
            this.velY = 0;
          }
  
          if (this.velX > 0) {
            // Столкновение слева блока
            newX = block.x - this.width;
            this.velX = -this.speed; // Меняем направление движения
          } else if (this.velX < 0) {
            // Столкновение справа блока
            newX = block.x + block.size;
            this.velX = this.speed; // Меняем направление движения
          }
  
          // Обновить прямоугольник после коррекции
          mobRect.x = newX;
          mobRect.y = newY;
        }
      }
  
      // Обновление позиции
      this.x = newX;
      this.y = newY;
  
      // Ограничение положения моба в мире
      if (this.x < 0) {
        this.x = 0;
        this.velX = this.speed; // Меняем направление движения
      }
      if (this.x + this.width > worldWidth * blockSize) {
        this.x = worldWidth * blockSize - this.width;
        this.velX = -this.speed; // Меняем направление движения
      }
      if (this.y < 0) {
        this.y = 0;
        this.velY = 0;
      }
      if (this.y + this.height > worldHeight * blockSize) {
        this.y = worldHeight * blockSize - this.height;
        this.velY = 0;
        this.isGrounded = true;
        this.isJumping = false;
      }
    }
  
    draw(camera) {
      if (this.isSpriteLoaded) {
        ctx.drawImage(
          this.spriteSheet,
          this.x - camera.x,
          this.y - camera.y,
          this.width,
          this.height
        );
      } else {
        // Рисуем прямоугольник вместо спрайта, если спрайт не загружен
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
      }
    }
  }
  
  // Вспомогательная функция для проверки столкновений AABB (дублируется в player.js)
  function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }