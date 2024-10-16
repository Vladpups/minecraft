// inventory.js

class Inventory {
    constructor() {
      this.items = {}; // { 'dirt': 10, 'stone': 5, ... }
      this.selectedItem = null;
      this.selectedHotbarSlot = 4; // Default selected slot (0-8)
      this.initializeHotbar();
    }
  
    initializeHotbar() {
      const hotbarSlots = document.querySelectorAll('.hotbar-slot');
      hotbarSlots.forEach((slot, index) => {
        slot.addEventListener('click', () => {
          this.selectHotbarSlot(index);
        });
      });
    }
  
    addItem(type, count = 1) {
      if (this.items[type]) {
        this.items[type] += count;
      } else {
        this.items[type] = count;
      }
      this.updateUI();
    }
  
    removeItem(type, count = 1) {
      if (this.items[type]) {
        this.items[type] -= count;
        if (this.items[type] <= 0) {
          delete this.items[type];
        }
        this.updateUI();
      }
    }
  
    selectItem(type) {
      this.selectedItem = type;
      this.updateUI();
    }
  
    selectHotbarSlot(index) {
      this.selectedHotbarSlot = index;
      const itemsArray = Object.keys(this.items);
      if (itemsArray[index]) {
        this.selectItem(itemsArray[index]);
      } else {
        this.selectItem(null);
      }
      this.updateUI();
    }
  
    updateUI() {
      // Обновление хотбара
      const hotbarSlots = document.querySelectorAll('.hotbar-slot');
      hotbarSlots.forEach((slot, index) => {
        slot.innerHTML = ''; // Очистить слот
  
        const itemType = Object.keys(this.items)[index];
        if (itemType) {
          const img = document.createElement('img');
          img.src = `assets/blocks/${itemType}.png`;
          img.alt = itemType;
          img.classList.add('item-icon');
          slot.appendChild(img);
  
          const count = document.createElement('div');
          count.classList.add('item-count');
          count.textContent = this.items[itemType];
          slot.appendChild(count);
        }
  
        if (index === this.selectedHotbarSlot) {
          slot.classList.add('selected');
        } else {
          slot.classList.remove('selected');
        }
      });
  
      // Обновление инвентаря
      const inventorySlots = document.querySelectorAll('.inventory-slot');
      inventorySlots.forEach((slot, index) => {
        const inventoryIndex = index;
        slot.innerHTML = ''; // Очистить слот
  
        const itemType = Object.keys(this.items)[inventoryIndex];
        if (itemType) {
          const img = document.createElement('img');
          img.src = `assets/blocks/${itemType}.png`;
          img.alt = itemType;
          img.classList.add('item-icon');
          slot.appendChild(img);
  
          const count = document.createElement('div');
          count.classList.add('item-count');
          count.textContent = this.items[itemType];
          slot.appendChild(count);
        }
      });
    }
  }
  