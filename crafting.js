// crafting.js

class Crafting {
    constructor(inventory) {
      this.inventory = inventory;
      this.recipes = {
        planks: {
          input: { 'wood': 1 },
          output: { 'planks': 4 },
        },
        // Добавьте другие рецепты по необходимости
      };
    }
  
    craft(item) {
      const recipe = this.recipes[item];
      if (!recipe) {
        console.log(`Нет рецепта для ${item}.`);
        return;
      }
  
      // Проверка наличия необходимых ингредиентов
      let canCraft = true;
      for (let key in recipe.input) {
        if (!this.inventory.items[key] || this.inventory.items[key] < recipe.input[key]) {
          canCraft = false;
          break;
        }
      }
  
      if (canCraft) {
        // Удаление ингредиентов
        for (let key in recipe.input) {
          this.inventory.removeItem(key, recipe.input[key]);
        }
  
        // Добавление результата
        for (let key in recipe.output) {
          this.inventory.addItem(key, recipe.output[key]);
        }
  
        console.log(`Скрафтено ${item}.`);
      } else {
        console.log(`Недостаточно ресурсов для крафта ${item}.`);
      }
    }
  }
  