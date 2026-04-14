// SHOP MODULE - Handles all shop-related functionality
class ShopModule {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  showShop() {
    this.game.showScreen('shop');
    this.filterShop('all');
  }

  filterShop(filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    let chars = Object.values(GAME_DATA.characters);
    const grid = this.game.$('shopGrid');
    grid.innerHTML = chars.map(char => {
      const owned = this.game.ownedCharacters.includes(char.id);
      return `
        <div class="item-card ${owned ? 'owned' : ''}" onclick="window.game.buyCharacter('${char.id}');">
          <div class="item-emoji">${char.emoji}</div>
          <div class="item-name">${char.name}</div>
          <div class="item-stats">?${char.hp} ?${char.atk}</div>
          ${owned ? '<div style="color: #00ff00;">?</div>' : `<div class="item-cost">? ${char.cost}g</div>`}
        </div>
      `;
    }).join('');
  }

  buyCharacter(charId) {
    const char = GAME_DATA.characters[charId];
    if (this.game.gold < char.cost) {
      alert(`? Precisa ${char.cost}g`);
      return;
    }
    this.game.gold -= char.cost;
    this.game.ownedCharacters.push(charId);
    alert(`? ${char.name}!`);
    this.game.updateUI();
    this.filterShop('all');
  }

  showPotions() {
    this.game.showScreen('potions');
    this.filterPotions('all');
  }

  filterPotions(filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    let potions = GAME_DATA.potions;
    const grid = this.game.$('potionsGrid');
    grid.innerHTML = potions.map(potion => `
      <div class="item-card" onclick="window.game.buyPotion('${potion.id}');">
        <div class="item-emoji">${potion.emoji}</div>
        <div class="item-name">${potion.name}</div>
        <div class="item-stats">${potion.desc}</div>
        <div class="item-cost">? ${potion.cost}g</div>
      </div>
    `).join('');
  }

  buyPotion(potionId) {
    const potion = GAME_DATA.potions.find(p => p.id === potionId);
    if (this.game.gold < potion.cost) {
      alert(`? Precisa ${potion.cost}g`);
      return;
    }
    this.game.gold -= potion.cost;
    this.game.potions[potionId]++;
    alert(`? ${potion.name}!`);
    this.game.updateUI();
  }

  showEquipment() {
    this.game.showScreen('equipment');
    this.filterEquipment('all');
  }

  filterEquipment(filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    const grid = this.game.$('equipmentGrid');
    grid.innerHTML = GAME_DATA.equipment.map(item => `
      <div class="item-card" onclick="window.game.buyEquipment('${item.id}');">
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-stats">?${item.atk} ?${item.def}</div>
        <div class="item-cost">? ${item.cost}g</div>
      </div>
    `).join('');
  }

  buyEquipment(equipmentId) {
    const item = GAME_DATA.equipment.find(e => e.id === equipmentId);
    if (this.game.gold < item.cost) {
      alert(`? Precisa ${item.cost}g`);
      return;
    }
    this.game.gold -= item.cost;
    this.game.equipment[equipmentId]++;
    alert(`? ${item.name}!`);
    this.game.updateUI();
  }

  showArtifacts() {
    this.game.showScreen('artifacts');
    this.filterArtifacts('all');
  }

  filterArtifacts(filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    const grid = this.game.$('artifactsGrid');
    grid.innerHTML = GAME_DATA.artifacts.map(item => `
      <div class="item-card" onclick="window.game.buyArtifact('${item.id}');">
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-stats">+${item.effect}</div>
        <div class="item-cost">? ${item.cost}g</div>
      </div>
    `).join('');
  }

  buyArtifact(artifactId) {
    const item = GAME_DATA.artifacts.find(a => a.id === artifactId);
    if (this.game.gold < item.cost) {
      alert(`? Precisa ${item.cost}g`);
      return;
    }
    this.game.gold -= item.cost;
    this.game.artifacts[artifactId]++;
    alert(`? ${item.name}!`);
    this.game.updateUI();
  }

  showInventory() {
    this.game.showScreen('inventory');
    const grid = this.game.$('inventoryGrid');
    const hasItems = Object.values(this.game.ownedCharacters).some(q => q > 0);

    if (!hasItems) {
      grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaaaaa;">Nenhum personagem desbloqueado!</div>';
      return;
    }

    grid.innerHTML = this.game.ownedCharacters.map(charId => {
      const char = GAME_DATA.characters[charId];
      const equipped = this.game.currentCharacterId === charId;
      return `
        <div class="inventory-item ${equipped ? 'equipped' : ''}" onclick="window.game.selectCharacter('${charId}');">
          <div class="inv-emoji">${char.emoji}</div>
          <div class="inv-name">${char.name}</div>
          <div class="inv-stats">?${char.hp} ?${char.atk} ?${char.def}</div>
          ${equipped ? '<div class="equipped-badge">EQUIPADO</div>' : ''}
        </div>
      `;
    }).join('');
  }

  selectCharacter(charId) {
    this.game.currentCharacterId = charId;
    this.game.character = GAME_DATA.characters[charId];
    this.game.playerCurrentHp = this.game.character.hp;
    alert(`? ${this.game.character.name} selecionado!`);
    this.game.updateUI();
  }

  showPotionInventory() {
    this.game.showScreen('potionInventory');
    const grid = this.game.$('potionInventoryGrid');
    const hasPotions = Object.values(this.game.potions).some(q => q > 0);

    if (!hasPotions) {
      grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaaaaa;">Nenhuma poção no inventário!</div>';
      return;
    }

    grid.innerHTML = GAME_DATA.potions.filter(potion => this.game.potions[potion.id] > 0).map(potion => {
      const count = this.game.potions[potion.id];
      return `
        <div class="inventory-item">
          <div class="inv-emoji">${potion.emoji}</div>
          <div class="inv-name">${potion.name}</div>
          <div class="inv-count">x${count}</div>
          <div class="inv-desc">${potion.desc}</div>
        </div>
      `;
    }).join('');
  }

  showEquipmentInventory() {
    this.game.showScreen('equipment-inv');
    const grid = this.game.$('equipmentInventoryGrid');
    const hasEquipment = Object.values(this.game.equipment).some(q => q > 0);

    if (!hasEquipment) {
      grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaaaaa;">Nenhum equipamento no inventário!</div>';
      return;
    }

    grid.innerHTML = GAME_DATA.equipment.filter(item => this.game.equipment[item.id] > 0).map(item => {
      const count = this.game.equipment[item.id];
      const equipped = this.game.equippedItems.weapon === item.id || this.game.equippedItems.armor === item.id;
      return `
        <div class="inventory-item ${equipped ? 'equipped' : ''}" onclick="window.game.equipItem('${item.id}');">
          <div class="inv-emoji">${item.emoji}</div>
          <div class="inv-name">${item.name}</div>
          <div class="inv-count">x${count}</div>
          <div class="inv-stats">?${item.atk} ?${item.def} ?${item.crit}%</div>
          ${equipped ? '<div class="equipped-badge">EQUIPADO</div>' : ''}
        </div>
      `;
    }).join('');
  }

  showArtifactsInventory() {
    this.game.showScreen('artifacts-inv');
    const grid = this.game.$('artifactsInventoryGrid');
    const hasArtifacts = Object.values(this.game.artifacts).some(q => q > 0);

    if (!hasArtifacts) {
      grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaaaaa;">Nenhum artefato no inventário!</div>';
      return;
    }

    grid.innerHTML = GAME_DATA.artifacts.filter(artifact => this.game.artifacts[artifact.id] > 0).map(artifact => {
      const count = this.game.artifacts[artifact.id];
      const equipped = this.game.equippedItems.artifact === artifact.id;
      return `
        <div class="inventory-item ${equipped ? 'equipped' : ''}" onclick="window.game.equipArtifact('${artifact.id}');">
          <div class="inv-emoji">${artifact.emoji}</div>
          <div class="inv-name">${artifact.name}</div>
          <div class="inv-count">x${count}</div>
          <div class="inv-stats">+${artifact.effect}</div>
          ${equipped ? '<div class="equipped-badge">EQUIPADO</div>' : ''}
        </div>
      `;
    }).join('');
  }

  equipItem(itemId) {
    const item = GAME_DATA.equipment.find(e => e.id === itemId);
    if (!item) return;

    if (item.type === 'weapon') {
      this.game.equippedItems.weapon = itemId;
    } else if (item.type === 'armor') {
      this.game.equippedItems.armor = itemId;
    }

    alert(`? ${item.name} equipado!`);
    this.game.updateUI();
    this.showEquipmentInventory();
  }

  equipArtifact(artifactId) {
    const artifact = GAME_DATA.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    this.game.equippedItems.artifact = artifactId;
    alert(`? ${artifact.name} equipado!`);
    this.game.updateUI();
    this.showArtifactsInventory();
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShopModule;
}