// UI MODULE - Handles all UI-related functionality
class UIModule {
  constructor(gameInstance) {
    this.game = gameInstance;
  }

  $(id) {
    return document.getElementById(id);
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.game.$(id).classList.add('active');
  }

  goLobby() {
    this.showScreen('lobby');
    this.game.updateUI();
  }

  setupEventListeners() {
    const userInput = this.game.$('user');
    if (userInput) {
      userInput.addEventListener('input', (e) => {
        const hint = this.game.$('userHint');
        const val = e.target.value;
        if (val.length < 3) {
          hint.innerText = '?? Mínimo 3';
        } else if (val.length > 20) {
          hint.innerText = '?? Máximo 20';
        } else {
          hint.innerText = '?? Válido';
        }
      });
    }

    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && document.activeElement.id === 'pass') {
        window.game.login();
      }
    });
  }

  login() {
    const u = this.game.$('user').value.trim();
    const p = this.game.$('pass').value;
    const msg = this.game.$('msg');

    if (!u || !p) {
      msg.innerText = '?? Preencha tudo!';
      msg.classList.add('error');
      return;
    }

    if (u.length < 3 || u.length > 20) {
      msg.innerText = '?? Usuário deve ter 3-20 caracteres!';
      msg.classList.add('error');
      return;
    }

    if (p.length < 4) {
      msg.innerText = '?? Senha deve ter pelo menos 4 caracteres!';
      msg.classList.add('error');
      return;
    }

    if (BLOCKED_NAMES.includes(u.toLowerCase())) {
      msg.innerText = '?? Nome de usuário não permitido!';
      msg.classList.add('error');
      return;
    }

    this.game.username = u;
    msg.innerText = '?? Login OK!';
    msg.classList.remove('error');
    msg.classList.add('success');

    setTimeout(() => {
      this.showScreen('lobby');
      this.game.$('headerContainer').style.display = 'flex';
      this.game.updateUI();
    }, 300);
  }

  register() {
    const u = this.game.$('user').value.trim();
    const p = this.game.$('pass').value;
    const msg = this.game.$('msg');

    if (!u || !p) {
      msg.innerText = '?? Preencha tudo!';
      msg.classList.add('error');
      return;
    }

    if (u.length < 3 || u.length > 20) {
      msg.innerText = '?? Usuário deve ter 3-20 caracteres!';
      msg.classList.add('error');
      return;
    }

    if (p.length < 4) {
      msg.innerText = '?? Senha deve ter pelo menos 4 caracteres!';
      msg.classList.add('error');
      return;
    }

    if (BLOCKED_NAMES.includes(u.toLowerCase())) {
      msg.innerText = '?? Nome de usuário não permitido!';
      msg.classList.add('error');
      return;
    }

    this.game.username = u;
    msg.innerText = '?? Conta criada!';
    msg.classList.remove('error');
    msg.classList.add('success');

    setTimeout(() => {
      this.showScreen('lobby');
      this.game.$('headerContainer').style.display = 'flex';
      this.game.updateUI();
    }, 300);
  }

  logout() {
    location.reload();
  }

  // SAVE/LOAD SYSTEM
  saveGame() {
    const saveData = {
      username: this.game.username,
      currentCharacterId: this.game.currentCharacterId,
      gold: this.game.gold,
      level: this.game.level,
      wins: this.game.wins,
      losses: this.game.losses,
      ownedCharacters: this.game.ownedCharacters,
      potions: this.game.potions,
      equipment: this.game.equipment,
      artifacts: this.game.artifacts,
      rareItems: this.game.rareItems,
      achievements: this.game.achievements,
      quests: this.game.quests,
      equippedItems: this.game.equippedItems
    };
    localStorage.setItem('rpgUltimateSave', JSON.stringify(saveData));
  }
  
  loadGame() {
    const savedData = localStorage.getItem('rpgUltimateSave');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        Object.assign(this.game, data);
        this.game.character = GAME_DATA.characters[this.game.currentCharacterId];
      } catch (e) {
        console.error('Failed to load save data:', e);
      }
    }
  }

  // Dynamic UI updates
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

  // UI Helpers
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    switch (type) {
      case 'success':
        notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        break;
      case 'error':
        notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        break;
      case 'warning':
        notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        break;
      default:
        notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Loading states
  showLoading(elementId) {
    const element = this.game.$(elementId);
    if (element) {
      element.innerHTML = '<div class="loading-spinner">?</div>';
      element.style.opacity = '0.7';
    }
  }

  hideLoading(elementId, content) {
    const element = this.game.$(elementId);
    if (element) {
      element.innerHTML = content;
      element.style.opacity = '1';
    }
  }

  // Modal functionality
  showModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${actions.length > 0 ? `
          <div class="modal-footer">
            ${actions.map(action => `
              <button class="btn-${action.type || 'secondary'}" onclick="${action.onclick}">
                ${action.text}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    document.body.appendChild(modal);
  }

  // Responsive UI adjustments
  adjustForMobile() {
    if (window.innerWidth <= 768) {
      document.body.classList.add('mobile-view');
    } else {
      document.body.classList.remove('mobile-view');
    }
  }

  // Theme switching (if needed in future)
  setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('rpg-theme', theme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('rpg-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIModule;
}