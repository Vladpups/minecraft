// main.js

// Создание глобальных переменных
const blockSize = 32; // Размер блока в пикселях
const gravity = 0.5;
const worldWidth = 100; // Количество блоков по горизонтали
const worldHeight = 30; // Количество блоков по вертикали

// Определение биомов
const biomes = [
  {
    name: 'Desert',
    topBlock: 'sand',
    layerBlock: 'sandstone',
    treeProbability: 0.01, // Пустыня почти без деревьев
    treeTypes: [], // Нет деревьев в пустыне
    color: '#EDC9AF', // Цвет биома для возможного использования
  },
  {
    name: 'Plains',
    topBlock: 'grass',
    layerBlock: 'dirt',
    treeProbability: 0.05, // Низкая вероятность деревьев
    treeTypes: ['oak'],
    color: '#7CFC00',
  },
  {
    name: 'Forest',
    topBlock: 'grass',
    layerBlock: 'dirt',
    treeProbability: 0.15, // Высокая вероятность деревьев
    treeTypes: ['oak', 'birch', 'pine'],
    color: '#228B22',
  },
  {
    name: 'Snow',
    topBlock: 'snow',
    layerBlock: 'ice',
    treeProbability: 0.05, // Низкая вероятность деревьев
    treeTypes: ['pine'],
    color: '#FFFFFF',
  },
  // Добавьте другие биомы по необходимости
];

// Настройка канваса на полный экран
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
  console.error('Canvas элемент с id "gameCanvas" не найден. Убедитесь, что он существует в index.html.');
}
const ctx = canvas.getContext('2d');

if (!ctx) {
  console.error('Не удалось получить контекст канваса. Проверьте, что канвас правильно инициализирован.');
}

// Функция изменения размера канваса
function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Генерация мира с рельефом и биомами
function generateWorld(width, height) {
  const generatedBlocks = [];
  const noise = new SimplexNoise();

  // Параметры для генерации биомов
  const biomeScale = 0.005; // Масштаб для биомной генерации
  const elevationScale = 0.05; // Масштаб для рельефа

  for (let x = 0; x < width; x++) {
    // Генерация высоты с помощью шумовой функции
    const elevation = Math.floor(
      (noise.noise2D(x * elevationScale, 0) + 1) * (height / 4)
    ) + Math.floor(height / 2); // Высота земли

    // Определение биома на основе шумовой функции
    const biomeValue = noise.noise2D(x * biomeScale, 0);
    let biome;
    if (biomeValue < -0.5) {
      biome = biomes.find(b => b.name === 'Desert');
    } else if (biomeValue < 0) {
      biome = biomes.find(b => b.name === 'Plains');
    } else if (biomeValue < 0.5) {
      biome = biomes.find(b => b.name === 'Forest');
    } else {
      biome = biomes.find(b => b.name === 'Snow');
    }

    for (let y = 0; y < height; y++) {
      if (y === elevation) {
        // Верхний слой
        generatedBlocks.push(new Block(x * blockSize, y * blockSize, biome.topBlock));
      } else if (y > elevation && y <= elevation + 3) {
        // Подлежащие слои (глубина 3 блока)
        generatedBlocks.push(new Block(x * blockSize, y * blockSize, biome.layerBlock));
      } else if (y > elevation + 3) {
        // Каменные слои
        generatedBlocks.push(new Block(x * blockSize, y * blockSize, 'stone'));
      }
    }
  }

  return generatedBlocks;
}

// Функция генерации деревьев
function generateTrees() {
  blocks.forEach(block => {
    // Определяем биом для данного блока
    const biome = biomes.find(b => b.topBlock === block.type || b.layerBlock === block.type);
    if (!biome || biome.treeProbability === 0) return;

    // Определяем, должно ли здесь быть дерево
    if (Math.random() < biome.treeProbability) {
      // Генерируем дерево
      if (biome.treeTypes.length === 0) return; // Нет деревьев в этом биоме

      const treeType = biome.treeTypes[Math.floor(Math.random() * biome.treeTypes.length)];
      placeTree(block.x, block.y - blockSize, treeType);
    }
  });
}

// Функция размещения дерева
function placeTree(x, y, type) {
  const maxTrunkHeight = type === 'oak' ? 6 : type === 'pine' ? 8 : 5;
  const trunkHeight = Math.floor(Math.random() * 2) + maxTrunkHeight - 2; // Варьируем высоту

  // Создание ствола
  for (let i = 0; i < trunkHeight; i++) {
    const trunkY = y - i * blockSize;
    if (trunkY < 0) break;
    const existingBlock = blocks.find(b => b.x === x && b.y === trunkY);
    if (!existingBlock) {
      blocks.push(new Block(x, trunkY, type === 'pine' ? 'wood_pine' : 'wood'));
    }
  }

  // Создание кроны
  if (type === 'oak') {
    // Крона дуба: несколько уровней с увеличивающимся радиусом
    const canopyLevels = 3;
    for (let i = 0; i < canopyLevels; i++) {
      const currentY = y - trunkHeight * blockSize - i * blockSize;
      const currentRadius = i + 2; // Увеличиваем радиус с каждым уровнем

      for (let dx = -currentRadius * blockSize; dx <= currentRadius * blockSize; dx += blockSize) {
        for (let dy = -currentRadius * blockSize; dy <= currentRadius * blockSize; dy += blockSize) {
          const leafX = x + dx;
          const leafY = currentY + dy;
          if (leafX < 0 || leafY < 0) continue;

          // Радиус круга для более естественной формы
          const distance = Math.sqrt((dx / blockSize) ** 2 + (dy / blockSize) ** 2);
          if (distance > currentRadius + 0.5) continue;

          const existingBlock = blocks.find(b => b.x === leafX && b.y === leafY);
          if (!existingBlock) {
            blocks.push(new Block(leafX, leafY, 'leaves'));
          }
        }
      }
    }
  } else if (type === 'pine') {
    // Крона сосны: треугольная форма с уменьшающимся количеством блоков сверху
    const canopyLevels = 4;
    for (let i = 0; i < canopyLevels; i++) {
      const currentY = y - trunkHeight * blockSize - i * blockSize;
      const currentRadius = canopyLevels - i; // Уменьшаем радиус с каждым уровнем

      for (let dx = -currentRadius * blockSize; dx <= currentRadius * blockSize; dx += blockSize) {
        const leafX = x + dx;
        const leafY = currentY;
        if (leafX < 0 || leafY < 0) continue;

        const existingBlock = blocks.find(b => b.x === leafX && b.y === leafY);
        if (!existingBlock) {
          blocks.push(new Block(leafX, leafY, 'leaves_pine'));
        }
      }
    }
  } else if (type === 'birch') {
    // Крона березы: высокая и стройная с плоской кроной
    const canopyHeight = 2;
    const canopyWidth = 3;

    // Стройная крона
    for (let i = 0; i < canopyHeight; i++) {
      const currentY = y - trunkHeight * blockSize - i * blockSize;
      for (let dx = -canopyWidth * blockSize; dx <= canopyWidth * blockSize; dx += blockSize) {
        const leafX = x + dx;
        const leafY = currentY;
        if (leafX < 0 || leafY < 0) continue;

        const existingBlock = blocks.find(b => b.x === leafX && b.y === leafY);
        if (!existingBlock) {
          blocks.push(new Block(leafX, leafY, 'leaves_birch'));
        }
      }
    }

    // Плоская крона
    const flatCanopyY = y - trunkHeight * blockSize - canopyHeight * blockSize;
    for (let dx = -canopyWidth * blockSize; dx <= canopyWidth * blockSize; dx += blockSize) {
      for (let dy = -canopyWidth * blockSize; dy <= canopyWidth * blockSize; dy += blockSize) {
        const leafX = x + dx;
        const leafY = flatCanopyY + dy;
        if (leafX < 0 || leafY < 0) continue;

        // Радиус круга для более естественной формы
        const distance = Math.sqrt((dx / blockSize) ** 2 + (dy / blockSize) ** 2);
        if (distance > canopyWidth + 0.5) continue;

        const existingBlock = blocks.find(b => b.x === leafX && b.y === leafY);
        if (!existingBlock) {
          blocks.push(new Block(leafX, leafY, 'leaves_birch'));
        }
      }
    }
  }
}

// Инициализация мира и объектов
let blocks = generateWorld(worldWidth, worldHeight);
generateTrees(); // Генерация деревьев после создания ландшафта

let mobs = [];
mobs.push(new Mob(300, 100)); // Пример добавления моба

const player = new Player(100, 100);
const inventory = new Inventory();
const crafting = new Crafting(inventory); // Теперь класс Crafting определён
const ui = new UI(player, inventory);

// Добавляем несколько блоков в инвентарь для теста
inventory.addItem('dirt', 10);
inventory.addItem('stone', 5);

// Предзагрузка всех спрайтов
const imagesToLoad = [];

// Добавление спрайтов игрока
if (player.spriteSheet) {
  imagesToLoad.push(player.spriteSheet);
}

// Добавление спрайтов мобов
mobs.forEach(mob => {
  if (mob.spriteSheet) {
    imagesToLoad.push(mob.spriteSheet);
  }
});

// Добавление спрайтов блоков (если есть анимированные блоки)
blocks.forEach(block => {
  if (block.isAnimated && block.spriteSheet) {
    imagesToLoad.push(block.spriteSheet);
  }
});

// Отслеживание загрузки всех изображений
let imagesLoaded = 0;
imagesToLoad.forEach(img => {
  if (img.complete) {
    imagesLoaded++;
    console.log(`Изображение загружено: ${img.src}`);
  } else {
    img.onload = () => {
      imagesLoaded++;
      console.log(`Изображение загружено: ${img.src}`);
      if (imagesLoaded === imagesToLoad.length) {
        // Все изображения загружены, запускаем игровой цикл
        console.log('Все изображения загружены. Запуск игрового цикла.');
        gameLoop();
      }
    };
    img.onerror = () => {
      console.error(`Не удалось загрузить изображение: ${img.src}`);
      imagesLoaded++;
      if (imagesLoaded === imagesToLoad.length) {
        // Все изображения загружены (включая неудачные), запускаем игровой цикл
        console.log('Некоторые изображения не удалось загрузить. Запуск игрового цикла.');
        gameLoop();
      }
    };
  }
});

// Если нет изображений для загрузки, сразу запускаем цикл
if (imagesToLoad.length === 0) {
  console.log('Нет изображений для загрузки. Запуск игрового цикла.');
  gameLoop();
}

// Обработка ввода
const keys = {};

// Предотвращение открытия контекстного меню при правом клике
canvas.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Обработка нажатия клавиш
document.addEventListener('keydown', function (e) {
  keys[e.code] = true;

  // Отображение/закрытие инвентаря
  if (e.code === 'KeyE') {
    const inventoryElement = document.getElementById('inventory');
    if (inventoryElement) {
      inventoryElement.classList.toggle('hidden');
    }
  }

  // Отображение/закрытие крафтинг-меню
  if (e.code === 'KeyC') {
    const craftingMenu = document.getElementById('crafting-menu');
    if (craftingMenu) {
      craftingMenu.classList.toggle('hidden');
    }
    // Пример крафта досок из дерева при нажатии C
    crafting.craft('planks');
  }

  // Смена хотбар слота с помощью цифровых клавиш 1-9
  if (e.code.startsWith('Digit')) {
    const index = parseInt(e.code.replace('Digit', '')) - 1;
    const itemsArray = Object.keys(inventory.items); // Исправлено с this.items
    if (itemsArray[index]) {
      inventory.selectItem(itemsArray[index]);
      inventory.selectHotbarSlot(index);
      console.log(`Выбран предмет: ${inventory.selectedItem}`);
    }
  }
});

// Обработка отпускания клавиш
document.addEventListener('keyup', function (e) {
  keys[e.code] = false;
});

// Обработка кликов мыши
canvas.addEventListener('mousedown', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left + camera.x;
  const mouseY = e.clientY - rect.top + camera.y;

  if (e.button === 0) {
    // Левая кнопка мыши - разрушение блока
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (
        mouseX > block.x &&
        mouseX < block.x + block.size &&
        mouseY > block.y &&
        mouseY < block.y + block.size
      ) {
        inventory.addItem(block.type);
        blocks.splice(i, 1);
        console.log(`Блок ${block.type} разрушен на (${block.x}, ${block.y}).`);
        break;
      }
    }
  } else if (e.button === 2) {
    // Правая кнопка мыши - размещение блока под курсором
    // Привязка к сетке
    const placeX = Math.floor(mouseX / blockSize) * blockSize;
    const placeY = Math.floor(mouseY / blockSize) * blockSize;

    // Проверка, нет ли блока на этой позиции
    const existingBlock = blocks.find(
      b => b.x === placeX && b.y === placeY
    );

    if (!existingBlock && inventory.selectedItem && inventory.items[inventory.selectedItem] > 0) {
      blocks.push(new Block(placeX, placeY, inventory.selectedItem));
      inventory.removeItem(inventory.selectedItem);
      console.log(`Блок ${inventory.selectedItem} размещен на (${placeX}, ${placeY}).`);
    } else {
      console.log(`Невозможно разместить блок на (${placeX}, ${placeY}).`);
    }
  }
});

// Функция обновления камеры
let camera = {
  x: 0,
  y: 0,
  width: canvas ? canvas.width : 0,
  height: canvas ? canvas.height : 0,
};

function updateCamera() {
  camera.x = player.x - canvas.width / 2 + player.width / 2;
  camera.y = player.y - canvas.height / 2 + player.height / 2;

  // Ограничения камеры, чтобы не выходить за пределы мира
  if (camera.x < 0) camera.x = 0;
  if (camera.y < 0) camera.y = 0;
  if (camera.x + canvas.width > worldWidth * blockSize)
    camera.x = worldWidth * blockSize - canvas.width;
  if (camera.y + canvas.height > worldHeight * blockSize)
    camera.y = worldHeight * blockSize - canvas.height;
}

// Смена дня и ночи
let time = 10;
const framesPerSecond = 60;
const dayLengthInMinutes = 24;
const dayLength = dayLengthInMinutes * 60 * framesPerSecond; // 24 минуты * 60 секунд = 1440 секунд

function drawDayNightCycle() {
  time = (time + 1) % dayLength;
  let brightness = Math.cos((time / dayLength) * 2 * Math.PI) * 0.5 + 0.5; // Значение от 0 до 1

  ctx.fillStyle = `rgba(0, 0, 0, ${1 - brightness * 0.5})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Игровой цикл
function gameLoop() {
  // Обработка ввода
  handleInput();

  // Обновление состояния
  player.update();
  mobs.forEach(mob => mob.update());
  updateBlocks();
  updateCamera();
  updateUIElements();

  // Отрисовка
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  blocks.forEach(block => block.draw(camera));
  player.draw(camera);
  mobs.forEach(mob => mob.draw(camera));
  drawDayNightCycle();
  ui.draw();

  // Продолжение игрового цикла
  requestAnimationFrame(gameLoop);
}

// Функция обработки ввода
function handleInput() {
  // Управление игроком
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.velX = -player.speed;
    player.facing = 'left';
    // console.log('Игрок движется влево.');
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    player.velX = player.speed;
    player.facing = 'right';
    // console.log('Игрок движется вправо.');
  } else {
    player.velX = 0;
  }

  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.isGrounded) {
    player.isJumping = true;
    player.isGrounded = false;
    player.velY = -player.jumpStrength;
    console.log('Игрок прыгает.');
  }
}

// Функция обновления выбора хотбара
function updateHotbarSelection() {
  const hotbarSlots = document.querySelectorAll('.hotbar-slot');
  hotbarSlots.forEach(slot => {
    slot.classList.remove('selected');
    if (parseInt(slot.dataset.slot) === inventory.selectedHotbarSlot) {
      slot.classList.add('selected');
    }
  });
}

// Функция обновления блоков (физика песка и воды)
function updateBlocks() {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === 'sand') {
      // Песок падает вниз
      let belowBlock = blocks.find(
        b => b.x === block.x && b.y === block.y + block.size
      );
      if (!belowBlock && block.y + block.size < worldHeight * blockSize) {
        block.y += block.size;
      }
    } else if (block.type === 'water') {
      // Вода растекается
      let belowBlock = blocks.find(
        b => b.x === block.x && b.y === block.y + block.size
      );
      if (!belowBlock && block.y + block.size < worldHeight * blockSize) {
        block.y += block.size;
      } else {
        // Растекается в стороны
        const directions = [-1, 1];
        for (let dir of directions) {
          let sideBlock = blocks.find(
            b => b.x === block.x + dir * blockSize && b.y === block.y
          );
          if (
            !sideBlock &&
            block.x + dir * blockSize >= 0 &&
            block.x + dir * blockSize < worldWidth * blockSize
          ) {
            blocks.push(new Block(block.x + dir * blockSize, block.y, 'water'));
          }
        }
      }
    }
  }
}

// Функция обновления UI элементов
function updateUI() {
  // Обновление здоровья
  const healthAmount = document.getElementById('health-amount');
  if (healthAmount) {
    healthAmount.textContent = Math.floor(player.health);
  }

  // Обновление голода
  const hungerAmount = document.getElementById('hunger-amount');
  if (hungerAmount) {
    hungerAmount.textContent = Math.floor(player.hunger);
  }
}

// Обновление UI в каждом кадре
function updateUIElements() {
  updateUI();
}

// Запуск игры после загрузки всех изображений
// Проверяем, загружены ли все изображения, и запускаем игровой цикл
// Если изображения уже загружены, gameLoop будет вызван в onload/onerror выше

// Если изображения загружены сразу (например, нет изображений для загрузки)
if (imagesLoaded === imagesToLoad.length) {
  console.log('Все изображения загружены. Запуск игрового цикла.');
  gameLoop();
}
