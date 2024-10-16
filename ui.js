// ui.js

class UI {
    constructor(player, inventory) {
      this.player = player;
      this.inventory = inventory;
      // Дополнительные элементы UI можно инициализировать здесь
    }
  
    draw() {
      // В данном случае UI обновляется напрямую через inventory.updateUI(),
      // поэтому возможно, здесь ничего не нужно делать.
      // Можно добавить дополнительные элементы UI, если необходимо.
    }
  }
  