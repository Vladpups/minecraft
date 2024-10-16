// world.js

function generateWorld(width, height) {
    const worldBlocks = [];
    const simplex = new SimplexNoise();
  
    for (let x = 0; x < width; x++) {
      // Используем шум Simplex для генерации высот
      let heightValue = Math.floor((simplex.noise2D(x / 50, 0) + 1) * (height / 4)) + Math.floor(height / 2);
  
      for (let y = 0; y < height; y++) {
        if (y > heightValue) {
          let type = 'dirt';
          if (y === heightValue + 1) {
            type = 'grass';
          } else if (y > heightValue + 5) {
            type = 'stone';
          }
          worldBlocks.push(new Block(x * blockSize, y * blockSize, type));
        }
      }
    }
  
    // Генерация деревьев после создания основного ландшафта
    generateTrees(worldBlocks, width, height, simplex);
  
    console.log(`Мир сгенерирован: ${worldBlocks.length} блоков.`);
    return worldBlocks;
  }
  
  function generateTrees(worldBlocks, width, height, simplex) {
    const treeCount = Math.floor(width / 10); // Количество деревьев зависит от ширины мира
    console.log(`Генерация ${treeCount} деревьев.`);
  
    for (let i = 0; i < treeCount; i++) {
      const treeX = Math.floor(Math.random() * width) * blockSize;
  
      // Найти высоту земли для текущего x
      let groundY = 0;
      for (let y = 0; y < height; y++) {
        const block = worldBlocks.find(b => b.x === treeX && b.y === y * blockSize);
        if (block && block.type === 'grass') {
          groundY = y * blockSize;
          break;
        }
      }
  
      // Генерация ствола дерева (например, высотой 4 блока)
      const trunkHeight = 4;
      for (let h = 1; h <= trunkHeight; h++) {
        const trunkBlockY = groundY - h * blockSize;
        if (trunkBlockY < 0) break;
        worldBlocks.push(new Block(treeX, trunkBlockY, 'log'));
      }
  
      // Генерация кроны дерева (например, круг или квадрат из блоков 'leaves' на верхушке ствола)
      const crownStartY = groundY - (trunkHeight + 1) * blockSize;
      const crownRadius = 2; // Радиус кроны
  
      for (let dx = -crownRadius; dx <= crownRadius; dx++) {
        for (let dy = -crownRadius; dy <= crownRadius; dy++) {
          // Простая круглая крона
          if (dx * dx + dy * dy <= crownRadius * crownRadius) {
            const crownX = treeX + dx * blockSize;
            const crownY = crownStartY + dy * blockSize;
            if (
              crownX >= 0 &&
              crownX < width * blockSize &&
              crownY >= 0 &&
              crownY < height * blockSize
            ) {
              // Проверка, нет ли блока на этой позиции
              const existingBlock = worldBlocks.find(b => b.x === crownX && b.y === crownY);
              if (!existingBlock) {
                worldBlocks.push(new Block(crownX, crownY, 'leaves'));
              }
            }
          }
        }
      }
    }
  
    console.log(`Деревья сгенерированы: ${treeCount} шт.`);
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
  