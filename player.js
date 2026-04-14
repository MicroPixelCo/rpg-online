// PLAYER MODULE - Handles all player-related functionality
class PlayerModule {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  getTotalStats() {
    const baseStats = { ...this.game.character };
    let bonusStats = { hp: 0, atk: 0, def: 0, crit: 0 };
    
    // Add equipment bonuses
    if (this.game.equippedItems.weapon) {
      const weapon = GAME_DATA.equipment.find(e => e.id === this.game.equippedItems.weapon);
      if (weapon) {
        bonusStats.atk += weapon.atk;
        bonusStats.def += weapon.def;
        bonusStats.crit += weapon.crit || 0;
      }
    }
    
    if (this.game.equippedItems.armor) {
      const armor = GAME_DATA.equipment.find(e => e.id === this.game.equippedItems.armor);
      if (armor) {
        bonusStats.atk += armor.atk;
        bonusStats.def += armor.def;
        bonusStats.crit += armor.crit || 0;
      }
    }
    
    if (this.game.equippedItems.artifact) {
      const artifact = GAME_DATA.artifacts.find(a => a.id === this.game.equippedItems.artifact);
      if (artifact) {
        if (artifact.type === 'power') {
          bonusStats.atk += artifact.effect;
        } else if (artifact.type === 'defense') {
          bonusStats.def += artifact.effect;
          bonusStats.hp += artifact.effect;
        }
      }
    }
    
    return {
      hp: baseStats.hp + bonusStats.hp,
      atk: baseStats.atk + bonusStats.atk,
      def: baseStats.def + bonusStats.def,
      crit: Math.max(0, baseStats.crit + bonusStats.crit)
    };
  }

  showStats() {
    this.game.showScreen('stats');
    const grid = this.game.$('statsGrid');
    const totalRareItems = Object.values(this.game.rareItems).reduce((sum, count) => sum + count, 0);

    grid.innerHTML = `
      <div style="font-size: 18px; color: #00ffff; margin: 10px 0;">
        <div>?? ${this.game.username}</div>
        <div>?? ${this.game.gold}g</div>
        <div>?? LVL ${this.game.level}</div>
        <div style="color: #00ff00;">? ${this.game.wins} Vitórias</div>
        <div style="color: #ff0000;">? ${this.game.losses} Derrotas</div>
        <div style="color: #ffd700;">?? ${totalRareItems} Itens Raros</div>
      </div>
    `;
  }

  showRareInventory() {
    this.game.showScreen('rare-inv');
    const grid = this.game.$('rareInventoryGrid');
    const hasRareItems = Object.values(this.game.rareItems).some(q => q > 0);

    if (!hasRareItems) {
      grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #aaaaaa;">Nenhum item raro encontrado. Derrote bosses para obtê-los!</div>';
      return;
    }

    grid.innerHTML = GAME_DATA.rareItems.filter(item => this.game.rareItems[item.id] > 0).map(item => {
      const count = this.game.rareItems[item.id];
      const stats = item.type === 'weapon' ? `?${item.atk} ??${item.def} ??${item.crit}%` : 
                    item.type === 'armor' ? `?${item.atk} ??${item.def} ??${item.crit}%` :
                    item.type === 'artifact' ? `+${item.effect}` : item.description;
      
      return `
        <div class="inventory-item" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05)); border: 2px solid #ffd700;">
          <div class="inv-emoji" style="font-size: 32px;">${item.emoji}</div>
          <div class="inv-name" style="color: #ffd700; font-weight: bold;">${item.name}</div>
          <div class="inv-count" style="color: #ffd700;">x${count}</div>
          <div style="font-size: 8px; color: #aaaaaa; margin-top: 4px;">${item.description}</div>
          ${stats ? `<div style="font-size: 8px; color: #ffff00; margin-top: 2px;">${stats}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  updateUI() {
    const stats = this.getTotalStats();
    this.game.$('welcomeMsg').innerText = `Bem-vindo, ${this.game.username}!`;
    this.game.$('goldDisplay').innerText = `?? ${this.game.gold}g`;
    this.game.$('currentCharEmoji').innerText = this.game.character.emoji;
    this.game.$('currentCharName').innerText = this.game.character.name;
    this.game.$('charDisplayHP').innerText = stats.hp;
    this.game.$('charDisplayATK').innerText = stats.atk;
    this.game.$('charDisplayDEF').innerText = stats.def;
    this.game.$('charDisplayCrit').innerText = stats.crit + '%';
    this.game.$('playerName').innerText = this.game.username;
    this.game.$('playerGold').innerText = this.game.gold;
    this.game.$('playerLvl').innerText = this.game.level;
    this.game.$('playerWins').innerText = this.game.wins;
    this.game.$('playerLosses').innerText = this.game.losses;
    
    // Update stats grid
    this.game.$('statHp').innerText = stats.hp;
    this.game.$('statAtk').innerText = stats.atk;
    this.game.$('statDef').innerText = stats.def;
    this.game.$('statCrit').innerText = stats.crit;
    
    this.game.saveGame();
  }

  selectCharacter(charId) {
    this.game.currentCharacterId = charId;
    this.game.character = GAME_DATA.characters[charId];
    this.game.playerCurrentHp = this.game.character.hp;
    alert(`? ${this.game.character.name} selecionado!`);
    this.game.updateUI();
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
    this.game.shop.showEquipmentInventory();
  }

  equipArtifact(artifactId) {
    const artifact = GAME_DATA.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    this.game.equippedItems.artifact = artifactId;
    alert(`? ${artifact.name} equipado!`);
    this.game.updateUI();
    this.game.shop.showArtifactsInventory();
  }

  // ACHIEVEMENTS SYSTEM
  checkAchievements() {
    GAME_DATA.achievements.forEach(achievement => {
      if (this.game.achievements[achievement.id]) return; // Already unlocked

      let unlocked = false;

      switch (achievement.id) {
        case 'first_win':
          unlocked = this.game.wins >= 1;
          break;
        case 'win_10':
          unlocked = this.game.wins >= 10;
          break;
        case 'win_50':
          unlocked = this.game.wins >= 50;
          break;
        case 'rich_1000':
          unlocked = this.game.gold >= 1000;
          break;
        case 'rich_5000':
          unlocked = this.game.gold >= 5000;
          break;
        case 'all_chars':
          unlocked = this.game.ownedCharacters.length >= Object.keys(GAME_DATA.characters).length;
          break;
      }

      if (unlocked) {
        this.game.achievements[achievement.id] = true;
        this.game.combat.showCombatMessage(`? Achievement desbloqueado: ${achievement.name}!`);
      }
    });
  }

  showAchievements() {
    this.game.showScreen('achievements');
    const grid = this.game.$('achievementsGrid');

    grid.innerHTML = GAME_DATA.achievements.map(achievement => {
      const unlocked = this.game.achievements[achievement.id];
      return `
        <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-emoji">${achievement.emoji}</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.desc}</div>
          <div style="margin-top: 8px; font-size: 8px;">
            ${unlocked ? '?? Desbloqueado' : '?? Bloqueado'}
          </div>
        </div>
      `;
    }).join('');
  }

  // QUEST SYSTEM
  updateQuestProgress(questId, amount) {
    if (!this.game.quests[questId]) return;

    const quest = GAME_DATA.quests.find(q => q.id === questId);
    if (!quest) return;

    this.game.quests[questId].progress = Math.min(quest.target, this.game.quests[questId].progress + amount);

    // Check if quest is completed
    if (this.game.quests[questId].progress >= quest.target && !this.game.quests[questId].completed) {
      this.game.quests[questId].completed = true;
      this.game.gold += quest.reward;
      this.game.combat.showCombatMessage(`? Missão completada: ${quest.name}! +${quest.reward}g`);
    }
  }

  showDailyQuests() {
    this.game.showScreen('quests');
    const list = this.game.$('questsList');
    const dailyQuests = GAME_DATA.quests.filter(q => q.type === 'daily');

    list.innerHTML = dailyQuests.map(quest => {
      const progress = this.game.quests[quest.id]?.progress || 0;
      const completed = this.game.quests[quest.id]?.completed || false;
      const progressPercent = (progress / quest.target) * 100;

      return `
        <div class="quest-card ${completed ? 'completed' : ''}">
          <div class="quest-title">${quest.name} ${completed ? '??' : ''}</div>
          <div class="quest-desc">${quest.desc}</div>
          <div style="margin-top: 8px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #00ff00, #00aa00); width: ${progressPercent}%; height: 100%;"></div>
            </div>
            <div style="font-size: 8px; margin-top: 4px; color: #aaaaaa;">
              Progress: ${progress}/${quest.target} | Recompensa: ${quest.reward}g
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showWeeklyQuests() {
    this.game.showScreen('quests');
    const list = this.game.$('questsList');
    const weeklyQuests = GAME_DATA.quests.filter(q => q.type === 'weekly');

    list.innerHTML = weeklyQuests.map(quest => {
      const progress = this.game.quests[quest.id]?.progress || 0;
      const completed = this.game.quests[quest.id]?.completed || false;
      const progressPercent = (progress / quest.target) * 100;

      return `
        <div class="quest-card ${completed ? 'completed' : ''}">
          <div class="quest-title">${quest.name} ${completed ? '??' : ''}</div>
          <div class="quest-desc">${quest.desc}</div>
          <div style="margin-top: 8px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #00ffff, #0088aa); width: ${progressPercent}%; height: 100%;"></div>
            </div>
            <div style="font-size: 8px; margin-top: 4px; color: #aaaaaa;">
              Progress: ${progress}/${quest.target} | Recompensa: ${quest.reward}g
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerModule;
}