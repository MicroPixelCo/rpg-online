// COMBAT MODULE - Handles all combat-related functionality
class CombatModule {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  startCombat(mode) {
    this.game.showScreen('combat');
    this.game.inCombat = true;
    this.game.combatRound = 1;
    
    // Select enemy based on mode
    const enemyKeys = Object.keys(GAME_DATA.enemies);
    let enemyKey;
    
    if (mode === 'boss') {
      enemyKey = 'dragao';
    } else if (mode === 'wave') {
      // Progressive difficulty for waves
      const waveIndex = Math.min(this.game.wins, enemyKeys.length - 1);
      enemyKey = enemyKeys[waveIndex];
    } else {
      // Random enemy for normal combat
      enemyKey = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
    }
    
    this.game.currentEnemy = { ...GAME_DATA.enemies[enemyKey] };
    this.game.playerCurrentHp = this.game.getTotalStats().hp;
    this.game.enemyCurrentHp = this.game.currentEnemy.hp;
    
    this.updateCombatUI();
    this.showCombatMessage(`? Combate contra ${this.game.currentEnemy.name} iniciado!`);
  }
  
  updateCombatUI() {
    const stats = this.game.getTotalStats();
    
    this.game.$('combatRound').innerText = `? Rodada: ${this.game.combatRound}`;
    this.game.$('enemyName').innerText = `${this.game.currentEnemy.emoji} ${this.game.currentEnemy.name}`;
    this.game.$('playerSprite').innerText = this.game.character.emoji;
    this.game.$('enemySprite').innerText = this.game.currentEnemy.emoji;
    
    // Update HP bars
    const playerHpPercent = (this.game.playerCurrentHp / stats.hp) * 100;
    const enemyHpPercent = (this.game.enemyCurrentHp / this.game.currentEnemy.hp) * 100;
    
    this.game.$('playerHpBar').style.width = playerHpPercent + '%';
    this.game.$('playerHpBar').innerText = `${this.game.playerCurrentHp}/${stats.hp}`;
    this.game.$('enemyHpBar').style.width = enemyHpPercent + '%';
    this.game.$('enemyHpBar').innerText = `${this.game.enemyCurrentHp}/${this.game.currentEnemy.hp}`;
  }
  
  showCombatMessage(message) {
    const log = this.game.$('combatLog');
    if (!log) return;
    
    const entry = document.createElement('div');
    entry.className = 'combat-log-entry';
    entry.textContent = message;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Keep only last 10 messages
    while (log.children.length > 10) {
      log.removeChild(log.firstChild);
    }
  }

  calculateDamage(attacker, defender, isCrit = false) {
    const baseDamage = attacker.atk;
    const defense = defender.def || 0;
    let damage = Math.max(1, baseDamage - defense + randomBetween(-2, 2));
    
    if (isCrit) {
      damage = Math.floor(damage * 1.5);
    }
    
    return damage;
  }

  attack() {
    if (!this.game.inCombat) return;
    
    const stats = this.game.getTotalStats();
    const isCrit = Math.random() * 100 < stats.crit;
    const damage = this.calculateDamage(stats, this.game.currentEnemy, isCrit);
    
    this.game.enemyCurrentHp -= damage;
    this.createDamageNumber(damage, isCrit, true);
    this.showCombatMessage(`? Você atacou! ${isCrit ? 'CRÍTICO! ' : ''}-${damage} HP`);
    
    if (this.game.enemyCurrentHp <= 0) {
      this.victory();
    } else {
      setTimeout(() => this.enemyTurn(), 1000);
    }
  }

  special() {
    if (!this.game.inCombat) return;
    
    const stats = this.game.getTotalStats();
    const isCrit = Math.random() * 100 < (stats.crit + 20); // Higher crit chance for special
    const damage = this.calculateDamage(stats, this.game.currentEnemy, isCrit) * 1.3;
    const finalDamage = Math.floor(damage);
    
    this.game.enemyCurrentHp -= finalDamage;
    this.createDamageNumber(finalDamage, isCrit, true);
    this.showCombatMessage(`? ATAQUE ESPECIAL! ${isCrit ? 'CRÍTICO! ' : ''}-${finalDamage} HP`);
    
    if (this.game.enemyCurrentHp <= 0) {
      this.victory();
    } else {
      setTimeout(() => this.enemyTurn(), 1000);
    }
  }

  defend() {
    if (!this.game.inCombat) return;
    
    this.showCombatMessage('? Posição defensiva! Dano reduzido no próximo turno.');
    // In a real implementation, you'd track defense state for next turn
    setTimeout(() => this.enemyTurn(), 1000);
  }

  dodge() {
    if (!this.game.inCombat) return;
    
    const dodgeChance = 25; // 25% dodge chance
    const success = Math.random() * 100 < dodgeChance;
    
    if (success) {
      this.showCombatMessage('? Esquiva bem-sucedida! Nenhum dano recebido.');
    } else {
      this.showCombatMessage('? Esquiva falhou!');
      setTimeout(() => this.enemyTurn(), 1000);
    }
  }

  enemyTurn() {
    if (!this.game.inCombat || this.game.enemyCurrentHp <= 0) return;
    
    const actions = ['attack', 'attack', 'attack', 'special']; // Enemy attacks more often
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    const stats = this.game.getTotalStats();
    const isCrit = Math.random() * 100 < this.game.currentEnemy.crit;
    
    if (action === 'attack') {
      const damage = this.calculateDamage(this.game.currentEnemy, stats, isCrit);
      this.game.playerCurrentHp -= damage;
      this.createDamageNumber(damage, isCrit, false);
      this.showCombatMessage(`? ${this.game.currentEnemy.name} atacou! ${isCrit ? 'CRÍTICO! ' : ''}-${damage} HP`);
    } else {
      const damage = this.calculateDamage(this.game.currentEnemy, stats, isCrit) * 1.3;
      const finalDamage = Math.floor(damage);
      this.game.playerCurrentHp -= finalDamage;
      this.createDamageNumber(finalDamage, isCrit, false);
      this.showCombatMessage(`? ${this.game.currentEnemy.name} usou ATAQUE ESPECIAL! ${isCrit ? 'CRÍTICO! ' : ''}-${finalDamage} HP`);
    }
    
    if (this.game.playerCurrentHp <= 0) {
      this.defeat();
    } else {
      this.game.combatRound++;
      this.updateCombatUI();
    }
  }

  createDamageNumber(damage, isCrit, isEnemy) {
    const container = isEnemy ? this.game.$('enemySprite').parentElement : this.game.$('playerSprite').parentElement;
    const sprite = isEnemy ? this.game.$('enemySprite') : this.game.$('playerSprite');
    const num = document.createElement('div');
    num.className = 'damage-number';
    num.textContent = damage;
    
    const isHeal = false;
    num.style.color = isHeal ? '#00ff00' : (isCrit ? '#ffff00' : '#ff6600');
    num.style.left = Math.random() * 50 + 'px';
    num.style.top = '0px';
    
    container.appendChild(num);
    
    // Add shake animation to the target
    sprite.classList.add('shake');
    setTimeout(() => sprite.classList.remove('shake'), 300);
    
    setTimeout(() => num.remove(), 1000);
  }

  // LOOT DROP SYSTEM
  calculateLootDrop() {
    if (!this.game.currentEnemy.isBoss) return null;
    
    const availableDrops = GAME_DATA.rareItems.filter(item => item.bossOnly);
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    
    for (const item of availableDrops) {
      cumulativeChance += item.dropChance;
      if (roll <= cumulativeChance) {
        return item;
      }
    }
    
    return null;
  }
  
  victory() {
    this.game.inCombat = false;
    this.game.wins++;
    this.game.gold += this.game.currentEnemy.gold;
    
    // Check for boss loot drops
    const loot = this.calculateLootDrop();
    let lootMessage = `? Vitória! +${this.game.currentEnemy.gold}g`;
    
    if (loot) {
      this.game.rareItems[loot.id]++;
      lootMessage += `\n? RARO: ${loot.emoji} ${loot.name}!`;
      this.showCombatMessage(`? Item raro obtido: ${loot.name}!`);
      
      // Add new achievement for rare items
      if (!this.game.achievements.first_rare) {
        this.game.achievements.first_rare = true;
        this.showCombatMessage('? Achievement: Primeiro Item Raro!');
      }
    }
    
    // Update quests
    this.game.updateQuestProgress('daily_1', 1);
    this.game.updateQuestProgress('weekly_1', 1);
    this.game.updateQuestProgress('daily_2', this.game.currentEnemy.gold);
    
    // Check achievements
    this.game.checkAchievements();
    
    this.showCombatMessage(lootMessage);
    
    setTimeout(() => {
      alert(lootMessage + `\nTotal de vitórias: ${this.game.wins}`);
      this.game.goLobby();
    }, 1500);
  }
  
  defeat() {
    this.game.inCombat = false;
    this.game.losses++;
    
    this.showCombatMessage('? Derrota!');
    
    setTimeout(() => {
      alert(`? Derrota!\nTente novamente!\nTotal de derrotas: ${this.game.losses}`);
      this.game.goLobby();
    }, 1500);
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CombatModule;
}