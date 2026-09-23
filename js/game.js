/**
 * ===================================================================
 * FUGA DO MACACO - Endless Runner 2D
 * Desenvolvido em HTML5 Canvas e JavaScript Puro (ES6+)
 * Sem dependências ou bibliotecas externas.
 * ===================================================================
 */

'use strict';

// -------------------------------------------------------------------
// 1. SISTEMA DE ÁUDIO (Web Audio API)
// -------------------------------------------------------------------
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('fuga_macaco_sound') !== 'false';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('fuga_macaco_sound', this.enabled ? 'true' : 'false');
    if (this.enabled) this.init();
    return this.enabled;
  }

  // Som de Pulo (Boing/Slide ascendente)
  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Som de Coleta de Banana (Dois sinos cristalinos alegres)
  playBanana() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [660, 990].forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0.2, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.16);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Som de Colisão / Dano (Impacto grave e atrito)
  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.25);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Som de Game Over (Jingle cômico e melancólico)
  playGameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [380, 330, 290, 220];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0.2, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.24);
      });
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Som de Clique nos botões
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }
}

// -------------------------------------------------------------------
// 2. SISTEMA DE PARTÍCULAS
// -------------------------------------------------------------------
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
  }

  // Partículas de poeira levantada pelas pegadas
  addDust(x, y) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 4 - 2),
        vx: -(1.5 + Math.random() * 2),
        vy: -(0.5 + Math.random() * 1.5),
        size: 3 + Math.random() * 4,
        alpha: 0.7,
        decay: 0.04,
        color: '#d4b28c',
        type: 'circle'
      });
    }
  }

  // Partículas douradas ao coletar banana
  addBananaSparkles(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        alpha: 1,
        decay: 0.03,
        color: Math.random() > 0.4 ? '#ffeb3b' : '#ff9800',
        type: 'star'
      });
    }

    // Texto flutuante +10
    this.floatingTexts.push({
      text: '+10',
      x: x,
      y: y - 10,
      vy: -1.6,
      alpha: 1,
      color: '#ffea00'
    });
  }

  // Partículas de impacto ao bater em obstáculo
  addHitSparks(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: 3 + Math.random() * 5,
        alpha: 1,
        decay: 0.035,
        color: Math.random() > 0.5 ? '#ff5252' : '#ffffff',
        type: 'spark'
      });
    }
  }

  // Fumaça saindo da cabeça da namorada zangada
  addAngerSmoke(x, y) {
    this.particles.push({
      x: x + (Math.random() * 6 - 3),
      y: y,
      vx: -(0.5 + Math.random() * 1),
      vy: -(1 + Math.random() * 1.5),
      size: 4 + Math.random() * 4,
      alpha: 0.8,
      decay: 0.03,
      color: '#ffffff',
      type: 'smoke'
    });
  }

  update() {
    // Atualizar partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.type === 'smoke' || p.type === 'circle') {
        p.size += 0.2;
      }
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Atualizar textos flutuantes
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.alpha -= 0.025;
      if (t.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    // Desenhar partículas
    this.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'star') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Desenhar textos flutuantes
    this.floatingTexts.forEach(t => {
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 20px Fredoka, sans-serif';
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x - 12, t.y);
      ctx.fillText(t.text, t.x - 12, t.y);
    });
    ctx.restore();
  }
}

// -------------------------------------------------------------------
// 3. CENÁRIO PARALLAX (Floresta Tropical em Camadas)
// -------------------------------------------------------------------
class ParallaxBackground {
  constructor(canvasWidth, canvasHeight, groundY) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.groundY = groundY;

    this.cloudOffset = 0;
    this.mountainOffset = 0;
    this.treesOffset = 0;
    this.groundOffset = 0;

    // Elementos decorativos procedurais
    this.clouds = [
      { x: 80, y: 70, scale: 1.1, speed: 0.15 },
      { x: 340, y: 110, scale: 0.8, speed: 0.18 },
      { x: 620, y: 60, scale: 1.2, speed: 0.14 },
      { x: 880, y: 120, scale: 0.9, speed: 0.16 }
    ];

    this.groundDetails = [];
    for (let i = 0; i < 40; i++) {
      this.groundDetails.push({
        x: i * 30 + Math.random() * 15,
        type: Math.random() > 0.4 ? 'grass' : (Math.random() > 0.5 ? 'flower' : 'pebble'),
        color: Math.random() > 0.5 ? '#ff4081' : '#ffeb3b',
        height: 6 + Math.random() * 8
      });
    }
  }

  update(gameSpeed) {
    this.cloudOffset += 0.4;
    this.mountainOffset += gameSpeed * 0.15;
    this.treesOffset += gameSpeed * 0.5;
    this.groundOffset += gameSpeed;

    // Atualizar nuvens
    this.clouds.forEach(c => {
      c.x -= c.speed * gameSpeed + 0.3;
      if (c.x < -140) {
        c.x = this.width + 80;
        c.y = 50 + Math.random() * 90;
      }
    });

    // Mover detalhes do chão
    this.groundDetails.forEach(g => {
      g.x -= gameSpeed;
      if (g.x < -30) {
        g.x += this.width + 60;
      }
    });
  }

  draw(ctx) {
    ctx.save();

    // 1. CÉU TROPICAL GRADIENTE
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, '#4fc3f7');    // Azul brilhante
    skyGrad.addColorStop(0.55, '#81d4fa'); // Azul ameno
    skyGrad.addColorStop(0.85, '#ffe082'); // Toque dourado tropical
    skyGrad.addColorStop(1, '#ffcc80');    // Horizonte quente
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. SOL CARTUNESCO RADIANTE
    const sunX = this.width * 0.82;
    const sunY = 90;
    // Brilho externo do sol
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 80);
    sunGlow.addColorStop(0, 'rgba(255, 241, 118, 0.9)');
    sunGlow.addColorStop(0.5, 'rgba(255, 213, 79, 0.4)');
    sunGlow.addColorStop(1, 'rgba(255, 213, 79, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
    ctx.fill();

    // Núcleo do Sol
    ctx.fillStyle = '#fff176';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
    ctx.fill();

    // 3. NUVENS FOFINHAS
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.clouds.forEach(c => {
      this.drawCloud(ctx, c.x, c.y, c.scale);
    });

    // 4. MONTANHAS DISTANTES (Camada 2 do Parallax)
    this.drawMountains(ctx);

    // 5. PALMEIRAS E BANANEIRAS DE MÉDIO PLANO (Camada 3)
    this.drawMidgroundTrees(ctx);

    // 6. CHÃO DA SELVA E VEGETAÇÃO
    this.drawGround(ctx);

    ctx.restore();
  }

  drawCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.arc(20, -8, 26, 0, Math.PI * 2);
    ctx.arc(46, -4, 20, 0, Math.PI * 2);
    ctx.arc(60, 4, 16, 0, Math.PI * 2);
    ctx.arc(28, 8, 22, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawMountains(ctx) {
    ctx.save();
    const mountainBase = this.groundY;
    const offset = this.mountainOffset % 600;

    ctx.fillStyle = '#5c8a70'; // Verde azulado suave distante
    for (let i = -1; i < 3; i++) {
      const baseX = i * 600 - offset;
      ctx.beginPath();
      ctx.moveTo(baseX, mountainBase);
      ctx.lineTo(baseX + 160, mountainBase - 150);
      ctx.lineTo(baseX + 260, mountainBase - 120);
      ctx.lineTo(baseX + 410, mountainBase - 180);
      ctx.lineTo(baseX + 600, mountainBase);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawMidgroundTrees(ctx) {
    ctx.save();
    const offset = this.treesOffset % 480;
    const baseY = this.groundY;

    for (let i = -1; i < 4; i++) {
      const treeX = i * 320 - (this.treesOffset % 960);
      
      // Palmeira Tropical estilizada
      ctx.fillStyle = '#6d4c41'; // Tronco curvado
      ctx.beginPath();
      ctx.moveTo(treeX, baseY);
      ctx.quadraticCurveTo(treeX + 15, baseY - 90, treeX + 25, baseY - 160);
      ctx.lineTo(treeX + 35, baseY - 160);
      ctx.quadraticCurveTo(treeX + 25, baseY - 90, treeX + 14, baseY);
      ctx.closePath();
      ctx.fill();

      // Folhas da palmeira
      const topX = treeX + 30;
      const topY = baseY - 160;
      ctx.fillStyle = '#2e7d32';

      const leafAngles = [-2.4, -1.8, -1.2, -0.6, 0, 0.6];
      leafAngles.forEach(ang => {
        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.ellipse(35, 0, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
    ctx.restore();
  }

  drawGround(ctx) {
    const gy = this.groundY;

    // Terra / Subsolo
    const dirtGrad = ctx.createLinearGradient(0, gy, 0, this.height);
    dirtGrad.addColorStop(0, '#5d4037');
    dirtGrad.addColorStop(0.2, '#4e342e');
    dirtGrad.addColorStop(1, '#271711');
    ctx.fillStyle = dirtGrad;
    ctx.fillRect(0, gy, this.width, this.height - gy);

    // Camada superior de Grama Vibrante
    const grassGrad = ctx.createLinearGradient(0, gy, 0, gy + 18);
    grassGrad.addColorStop(0, '#66bb6a');
    grassGrad.addColorStop(1, '#388e3c');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, gy, this.width, 18);

    // Borda superior ondulada de grama
    ctx.fillStyle = '#81c784';
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (let x = 0; x <= this.width; x += 15) {
      const wave = Math.sin((x + this.groundOffset) * 0.15) * 3;
      ctx.lineTo(x, gy + wave);
    }
    ctx.lineTo(this.width, gy + 8);
    ctx.lineTo(0, gy + 8);
    ctx.closePath();
    ctx.fill();

    // Detalhes móveis do chão (tufos de grama, florzinhas, pedrinhas)
    this.groundDetails.forEach(g => {
      if (g.type === 'grass') {
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(g.x, gy);
        ctx.lineTo(g.x - 3, gy - g.height);
        ctx.moveTo(g.x + 4, gy);
        ctx.lineTo(g.x + 5, gy - g.height * 0.8);
        ctx.stroke();
      } else if (g.type === 'flower') {
        // Haste
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(g.x, gy);
        ctx.lineTo(g.x, gy - 8);
        ctx.stroke();
        // Pétalas
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(g.x, gy - 9, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (g.type === 'pebble') {
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.ellipse(g.x, gy + 5, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}

// -------------------------------------------------------------------
// 4. PERSONAGEM PRINCIPAL: O MACACO (MonkeyPlayer)
// -------------------------------------------------------------------
class MonkeyPlayer {
  constructor(x, groundY) {
    this.x = x;
    this.groundY = groundY;
    this.width = 54;
    this.height = 64;

    this.y = this.groundY - this.height;
    this.vy = 0;
    this.gravity = 0.65;
    this.jumpForce = -13.5;
    this.isGrounded = true;

    // Estados de Animação
    this.runFrame = 0;
    this.tailAngle = 0;
    this.invulnerableTime = 0;
    this.isDead = false;
    this.deathY = 0;
  }

  reset() {
    this.y = this.groundY - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.runFrame = 0;
    this.invulnerableTime = 0;
    this.isDead = false;
  }

  jump() {
    if (this.isGrounded && !this.isDead) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      return true;
    }
    return false;
  }

  update(particleSystem) {
    if (this.isDead) {
      this.vy += this.gravity;
      this.y += this.vy;
      return;
    }

    // Física de Pulo e Gravidade
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y >= this.groundY - this.height) {
      if (!this.isGrounded) {
        // Levantou poeira ao aterrissar
        particleSystem.addDust(this.x + 20, this.groundY);
      }
      this.y = this.groundY - this.height;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Animação de corrida
    if (this.isGrounded) {
      this.runFrame += 0.22;
      this.tailAngle = Math.sin(this.runFrame) * 0.35;

      // Poeira ao correr
      if (Math.floor(this.runFrame * 5) % 8 === 0) {
        particleSystem.addDust(this.x + 10, this.groundY);
      }
    } else {
      this.tailAngle = 0.5; // Rabo empinado no pulo
    }

    if (this.invulnerableTime > 0) {
      this.invulnerableTime--;
    }
  }

  // Hitbox para colisão justa
  getHitbox() {
    return {
      x: this.x + 10,
      y: this.y + 8,
      width: this.width - 18,
      height: this.height - 12
    };
  }

  draw(ctx) {
    ctx.save();

    // Efeito de piscar durante invulnerabilidade
    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 4) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.translate(cx, cy);

    if (this.isDead) {
      ctx.rotate(0.6); // Queda dramática
    }

    // Posição de quique ao correr
    const bobY = this.isGrounded ? Math.sin(this.runFrame * 2) * 3 : -4;
    ctx.translate(0, bobY);

    // 1. RABO DO MACACO (Em espiral animada)
    ctx.save();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.quadraticCurveTo(-34, 10 + this.tailAngle * 25, -28, -8 + this.tailAngle * 18);
    ctx.quadraticCurveTo(-22, -18, -14, -12);
    ctx.stroke();
    ctx.restore();

    // 2. BRAÇO ESQUERDO / DE TRÁS
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    const armBackAng = this.isGrounded ? Math.cos(this.runFrame) * 0.7 : -0.8;
    ctx.save();
    ctx.translate(-6, 2);
    ctx.rotate(armBackAng);
    ctx.ellipse(0, 10, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. PERNAS DO MACACO
    const legAng1 = this.isGrounded ? Math.sin(this.runFrame) * 0.8 : 0.6;
    const legAng2 = this.isGrounded ? -Math.sin(this.runFrame) * 0.8 : -0.3;

    // Perna de trás
    ctx.fillStyle = '#5d4037';
    ctx.save();
    ctx.translate(-8, 16);
    ctx.rotate(legAng1);
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 15, 4);
    ctx.fill();
    // Pé
    ctx.beginPath();
    ctx.ellipse(2, 14, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. CORPO DO MACACO
    ctx.fillStyle = '#795548'; // Pelagem marrom carismática
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Barriguinha fofa (bege)
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.ellipse(2, 6, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Perna da frente
    ctx.fillStyle = '#6d4c41';
    ctx.save();
    ctx.translate(6, 16);
    ctx.rotate(legAng2);
    ctx.beginPath();
    ctx.roundRect(-4, 0, 8, 15, 4);
    ctx.fill();
    // Pé
    ctx.beginPath();
    ctx.ellipse(2, 14, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. CABEÇA DO MACACO
    const headY = -18;
    // Orelha esquerda
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(-16, headY - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffccbc';
    ctx.beginPath();
    ctx.arc(-16, headY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Orelha direita
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(16, headY - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffccbc';
    ctx.beginPath();
    ctx.arc(16, headY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Formato da Cabeça
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Área dos Olhos / Focinho (Bege cartum)
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.arc(-5, headY - 2, 6.5, 0, Math.PI * 2);
    ctx.arc(5, headY - 2, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, headY + 5, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos
    if (this.isDead) {
      // Olhos em "X" ao morrer
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2;
      [[-5, headY - 2], [5, headY - 2]].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(ex - 3, ey - 3); ctx.lineTo(ex + 3, ey + 3);
        ctx.moveTo(ex + 3, ey - 3); ctx.lineTo(ex - 3, ey + 3);
        ctx.stroke();
      });
    } else {
      // Olhos grandes e brilhantes
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(-4, headY - 2, 3, 0, Math.PI * 2);
      ctx.arc(4, headY - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Brilho dos olhos
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3.2, headY - 3, 1.2, 0, Math.PI * 2);
      ctx.arc(4.8, headY - 3, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nariz e Sorriso
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.arc(0, headY + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, headY + 5, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // 6. BRAÇO DA FRENTE SEGURANDO BANANAS ROUBADAS!
    ctx.fillStyle = '#6d4c41';
    ctx.save();
    ctx.translate(6, 2);
    const armFrontAng = this.isGrounded ? -Math.cos(this.runFrame) * 0.7 : -1.2;
    ctx.rotate(armFrontAng);
    ctx.beginPath();
    ctx.ellipse(0, 8, 4, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Banana na mão do macaco! 🍌
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.ellipse(4, 12, 5, 2.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

// -------------------------------------------------------------------
// 5. NAMORADA DO MACACO: A AMEAÇA CONSTANTE (GirlfriendChaser)
// -------------------------------------------------------------------
class GirlfriendChaser {
  constructor(groundY) {
    this.groundY = groundY;
    this.width = 54;
    this.height = 64;

    this.safeDistance = 260;   // Distância segura atrás do macaco
    this.dangerDistance = 60;  // Distância onde captura o macaco
    this.currentOffset = 260;  // Offset atual atrás do jogador
    this.targetOffset = 260;

    this.y = this.groundY - this.height;
    this.runFrame = 0;
    this.angerSmokeTimer = 0;
  }

  reset() {
    this.currentOffset = 260;
    this.targetOffset = 260;
    this.runFrame = 0;
  }

  // Quando o jogador bate num obstáculo, a namorada avança rapidamente!
  bringCloser() {
    this.targetOffset = Math.max(50, this.targetOffset - 85);
  }

  update(monkeyX, particleSystem, isPlaying) {
    if (!isPlaying) return;

    // Se o jogador corre suavemente, ela recua bem aos poucos até a distância padrão
    if (this.targetOffset < this.safeDistance) {
      this.targetOffset += 0.08;
    }

    // Interpolação suave de posição
    this.currentOffset += (this.targetOffset - this.currentOffset) * 0.04;

    this.runFrame += 0.28; // Corre mais rápido e agressiva!

    // Posição na tela (sempre atrás do macaco à esquerda)
    this.x = monkeyX - this.currentOffset;

    // Fumaça de raiva saindo da cabeça
    this.angerSmokeTimer++;
    if (this.angerSmokeTimer % 12 === 0) {
      particleSystem.addAngerSmoke(this.x + 32, this.groundY - 60);
      particleSystem.addDust(this.x + 10, this.groundY);
    }
  }

  // Porcentagem de perigo para barra do HUD (0% = longe, 100% = colada)
  getDangerPercent() {
    const minD = 50;
    const maxD = this.safeDistance;
    const p = 1 - (this.currentOffset - minD) / (maxD - minD);
    return Math.max(0, Math.min(100, Math.round(p * 100)));
  }

  // Checa se a namorada alcançou o macaco
  hasCaughtMonkey() {
    return this.currentOffset <= 55;
  }

  draw(ctx) {
    // Se estiver fora da tela à esquerda, não renderizar
    if (this.x < -80) return;

    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.groundY - this.height / 2;

    ctx.translate(cx, cy);

    // Movimento agressivo de corrida inclinada pra frente
    ctx.rotate(0.14);
    const bobY = Math.sin(this.runFrame * 2) * 3;
    ctx.translate(0, bobY);

    // 1. RABO FURIOSO
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.quadraticCurveTo(-30, 0, -20, -14);
    ctx.stroke();

    // 2. PERNAS DA NAMORADA (Passadas largas e furiosas)
    const legAng1 = Math.sin(this.runFrame) * 0.9;
    const legAng2 = -Math.sin(this.runFrame) * 0.9;

    ctx.fillStyle = '#4e342e';
    ctx.save();
    ctx.translate(-8, 16);
    ctx.rotate(legAng1);
    ctx.roundRect(-4, 0, 8, 15, 4);
    ctx.fill();
    ctx.restore();

    // 3. CORPO
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.ellipse(0, 4, 15, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // Roupinha / laço visual
    ctx.fillStyle = '#f48fb1';
    ctx.beginPath();
    ctx.ellipse(2, 6, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Perna da frente
    ctx.fillStyle = '#5d4037';
    ctx.save();
    ctx.translate(6, 16);
    ctx.rotate(legAng2);
    ctx.roundRect(-4, 0, 8, 15, 4);
    ctx.fill();
    ctx.restore();

    // 4. CABEÇA
    const headY = -18;
    // Orelhas
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.arc(-16, headY - 2, 7, 0, Math.PI * 2);
    ctx.arc(16, headY - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Formato da Cabeça
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(0, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Laço Vermelho / Rosa no topo da cabeça
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    // Asa esquerda do laço
    ctx.ellipse(-7, headY - 14, 6, 4, -0.4, 0, Math.PI * 2);
    // Asa direita do laço
    ctx.ellipse(7, headY - 14, 6, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(0, headY - 14, 3, 0, Math.PI * 2);
    ctx.fill();

    // Focinho
    ctx.fillStyle = '#f8bbd0';
    ctx.beginPath();
    ctx.arc(-5, headY - 2, 6, 0, Math.PI * 2);
    ctx.arc(5, headY - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, headY + 5, 9, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // OLHOS FURIOSOS (Sobrancelhas em "V" bem bravo)
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-4, headY - 1, 3, 0, Math.PI * 2);
    ctx.arc(4, headY - 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sobrancelhas de raiva
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-8, headY - 6); ctx.lineTo(-1, headY - 3);
    ctx.moveTo(8, headY - 6); ctx.lineTo(1, headY - 3);
    ctx.stroke();

    // Boca brava / gritando
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.arc(0, headY + 6, 3.5, 0, Math.PI);
    ctx.fill();

    // Braços esticados pra frente tentando agarrar o macaco!
    ctx.fillStyle = '#5d4037';
    ctx.save();
    ctx.translate(6, 4);
    ctx.rotate(0.4);
    ctx.roundRect(0, -3, 20, 6, 3);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

// -------------------------------------------------------------------
// 6. OBSTÁCULOS (ObstacleManager)
// -------------------------------------------------------------------
class ObstacleManager {
  constructor(canvasWidth, groundY) {
    this.width = canvasWidth;
    this.groundY = groundY;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.minDistance = 280; // Distância mínima justa entre obstáculos
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 40; // Dá um tempo inicial livre para o jogador
  }

  update(gameSpeed) {
    // Mover obstáculos existentes
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= gameSpeed;

      // Remover se saiu da tela
      if (obs.x + obs.width < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Gerador de novos obstáculos com espaçamento justo
    this.spawnTimer -= 1;
    if (this.spawnTimer <= 0) {
      // Checar se o último obstáculo já andou o suficiente
      const lastObs = this.obstacles[this.obstacles.length - 1];
      if (!lastObs || (this.width - lastObs.x) >= this.minDistance) {
        this.spawnRandomObstacle();
        // Tempo até o próximo obstáculo ajustado pela velocidade
        const randomGap = Math.random() * 50;
        this.spawnTimer = Math.max(35, Math.floor(55 - (gameSpeed * 1.5)) + randomGap);
      }
    }
  }

  spawnRandomObstacle() {
    const types = ['rock', 'log', 'bush', 'critter'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obs = {
      type: type,
      x: this.width + 40,
      width: 44,
      height: 40,
      y: this.groundY - 40,
      passed: false
    };

    if (type === 'rock') {
      obs.width = 46;
      obs.height = 36;
      obs.y = this.groundY - 36;
    } else if (type === 'log') {
      obs.width = 52;
      obs.height = 38;
      obs.y = this.groundY - 38;
    } else if (type === 'bush') {
      obs.width = 48;
      obs.height = 44;
      obs.y = this.groundY - 44;
    } else if (type === 'critter') {
      obs.width = 40;
      obs.height = 32;
      obs.y = this.groundY - 32;
      obs.animFrame = 0;
    }

    this.obstacles.push(obs);
  }

  draw(ctx) {
    this.obstacles.forEach(obs => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'rock') {
        // Rocha da selva com musgo
        ctx.fillStyle = '#616161';
        ctx.beginPath();
        ctx.moveTo(4, obs.height);
        ctx.lineTo(12, 10);
        ctx.lineTo(26, 4);
        ctx.lineTo(obs.width - 6, 12);
        ctx.lineTo(obs.width, obs.height);
        ctx.closePath();
        ctx.fill();

        // Musgo verde no topo
        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.ellipse(22, 10, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

      } else if (obs.type === 'log') {
        // Tronco cortado com cogumelos
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.roundRect(0, 8, obs.width, obs.height - 8, 6);
        ctx.fill();

        // Anel do tronco
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.ellipse(obs.width - 6, obs.height / 2 + 3, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cogumelo vermelho bonitinho
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.arc(14, 6, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(14, 4, 2, 0, Math.PI * 2);
        ctx.fill();

      } else if (obs.type === 'bush') {
        // Arbusto espinhoso tropical
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(14, obs.height - 18, 16, 0, Math.PI * 2);
        ctx.arc(32, obs.height - 20, 18, 0, Math.PI * 2);
        ctx.arc(22, 14, 15, 0, Math.PI * 2);
        ctx.fill();

        // Detalhes de espinhos
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 20); ctx.lineTo(6, 14);
        ctx.moveTo(34, 18); ctx.lineTo(40, 12);
        ctx.stroke();

      } else if (obs.type === 'critter') {
        // Caranguejo ou pequena criatura da selva
        ctx.fillStyle = '#e65100';
        ctx.beginPath();
        ctx.ellipse(obs.width / 2, obs.height - 12, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Garras
        ctx.beginPath();
        ctx.arc(6, obs.height - 20, 6, 0, Math.PI * 2);
        ctx.arc(obs.width - 6, obs.height - 20, 6, 0, Math.PI * 2);
        ctx.fill();

        // Olhos arregalados
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(14, obs.height - 20, 4, 0, Math.PI * 2);
        ctx.arc(26, obs.height - 20, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(14, obs.height - 20, 2, 0, Math.PI * 2);
        ctx.arc(26, obs.height - 20, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}

// -------------------------------------------------------------------
// 7. BANANAS COLECIONÁVEIS (BananaManager)
// -------------------------------------------------------------------
class BananaManager {
  constructor(canvasWidth, groundY) {
    this.width = canvasWidth;
    this.groundY = groundY;
    this.bananas = [];
    this.spawnTimer = 20;
    this.hoverFrame = 0;
  }

  reset() {
    this.bananas = [];
    this.spawnTimer = 30;
  }

  update(gameSpeed) {
    this.hoverFrame += 0.08;

    // Mover bananas existentes
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      const b = this.bananas[i];
      b.x -= gameSpeed;

      if (b.x < -30) {
        this.bananas.splice(i, 1);
      }
    }

    // Gerar novas bananas
    this.spawnTimer -= 1;
    if (this.spawnTimer <= 0) {
      this.spawnPattern();
      this.spawnTimer = 45 + Math.random() * 50;
    }
  }

  spawnPattern() {
    const isArc = Math.random() > 0.45;

    if (isArc) {
      // Arco de 3 a 5 bananas que incentivam o pulo
      const count = 4;
      const startX = this.width + 50;
      for (let i = 0; i < count; i++) {
        // Fórmula de parábola de pulo
        const progress = i / (count - 1);
        const arcY = Math.sin(progress * Math.PI) * 95;
        this.bananas.push({
          x: startX + i * 42,
          baseY: this.groundY - 50 - arcY,
          size: 20
        });
      }
    } else {
      // Sequência simples no chão
      const startX = this.width + 50;
      for (let i = 0; i < 3; i++) {
        this.bananas.push({
          x: startX + i * 36,
          baseY: this.groundY - 45,
          size: 20
        });
      }
    }
  }

  draw(ctx) {
    ctx.save();
    this.bananas.forEach(b => {
      const currentY = b.baseY + Math.sin(this.hoverFrame + b.x * 0.02) * 4;

      ctx.save();
      ctx.translate(b.x, currentY);

      // Brilho dourado pulsante
      ctx.shadowColor = 'rgba(255, 235, 59, 0.8)';
      ctx.shadowBlur = 10;

      // Desenho Cartum da Banana
      ctx.strokeStyle = '#ffd600';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.arc(0, 0, 12, 0.15 * Math.PI, 0.85 * Math.PI, false);
      ctx.stroke();

      // Cabinho marrom
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(9, 4);
      ctx.lineTo(13, 1);
      ctx.stroke();

      ctx.restore();
    });
    ctx.restore();
  }
}

// -------------------------------------------------------------------
// 8. MOTOR PRINCIPAL DO JOGO (GameEngine)
// -------------------------------------------------------------------
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Resolução base nativa
    this.nativeWidth = 960;
    this.nativeHeight = 540;
    this.groundY = 440;

    // Gerenciadores do Sistema
    this.audio = new SoundSystem();
    this.particles = new ParticleSystem();
    this.bg = new ParallaxBackground(this.nativeWidth, this.nativeHeight, this.groundY);
    this.player = new MonkeyPlayer(240, this.groundY);
    this.girlfriend = new GirlfriendChaser(this.groundY);
    this.obstacles = new ObstacleManager(this.nativeWidth, this.groundY);
    this.bananas = new BananaManager(this.nativeWidth, this.groundY);

    // Estados do Jogo: 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.state = 'START';

    // Parâmetros de Gameplay
    this.lives = 3;
    this.distance = 0;
    this.bananasCollected = 0;
    this.score = 0;
    this.baseSpeed = 6.0;
    this.currentSpeed = 6.0;

    // Recorde com LocalStorage
    this.highScore = parseInt(localStorage.getItem('fuga_macaco_high_score') || '0', 10);
    this.highDistance = parseInt(localStorage.getItem('fuga_macaco_high_distance') || '0', 10);

    // Frases engraçadas de Game Over
    this.funnyQuotes = [
      '"Você corre como uma banana amassada."',
      '"Talvez fosse melhor ter devolvido as bananas..."',
      '"Ela estava REALMENTE brava desta vez!"',
      '"Na próxima vez, compre suas próprias bananas!"',
      '"O relacionamento acabou. Definitivamente. 💔"',
      '"Nem o cipó mais alto te salvaria da fúria dela!"'
    ];

    // Cache dos elementos DOM
    this.initDOMElements();

    // Eventos
    this.bindEvents();

    // Loop
    this.lastTime = 0;
    this.updateHUD();
    this.showScreen('start');

    // Iniciar animação contínua
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  initDOMElements() {
    this.dom = {
      hud: document.getElementById('game-hud'),
      hudScore: document.getElementById('hud-score'),
      hudDistance: document.getElementById('hud-distance'),
      threatBarFill: document.getElementById('threat-bar-fill'),
      hearts: [
        document.getElementById('heart-1'),
        document.getElementById('heart-2'),
        document.getElementById('heart-3')
      ],
      soundIcon: document.getElementById('sound-icon'),
      dangerOverlay: document.getElementById('danger-overlay'),
      damageFlash: document.getElementById('damage-flash'),
      mobileJumpBtn: document.getElementById('mobile-jump-btn'),
      // Telas
      screenStart: document.getElementById('screen-start'),
      modalInstructions: document.getElementById('modal-instructions'),
      screenPause: document.getElementById('screen-pause'),
      screenGameOver: document.getElementById('screen-gameover'),
      // Start Screen Stats
      startRecordScore: document.getElementById('start-record-score'),
      startRecordDist: document.getElementById('start-record-dist'),
      // Game Over Stats
      gameoverScore: document.getElementById('gameover-score'),
      gameoverDistance: document.getElementById('gameover-distance'),
      gameoverBananas: document.getElementById('gameover-bananas'),
      gameoverQuote: document.getElementById('gameover-quote'),
      newRecordBadge: document.getElementById('new-record-badge'),
      // Botões
      btnPlay: document.getElementById('btn-play'),
      btnHowToPlay: document.getElementById('btn-how-to-play'),
      btnCloseInstructions: document.getElementById('btn-close-instructions'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      btnPauseToggle: document.getElementById('btn-pause-toggle'),
      btnResume: document.getElementById('btn-resume'),
      btnRestartPause: document.getElementById('btn-restart-pause'),
      btnTryAgain: document.getElementById('btn-try-again'),
      btnMenu: document.getElementById('btn-menu')
    };

    // Atualizar recorde inicial na tela inicial
    this.dom.startRecordScore.textContent = this.highScore;
    this.dom.startRecordDist.textContent = `${this.highDistance}m`;
    this.updateSoundIcon();
  }

  updateSoundIcon() {
    this.dom.soundIcon.textContent = this.audio.enabled ? '🔊' : '🔇';
  }

  bindEvents() {
    // 1. Teclado
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.handleJump();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        this.togglePause();
      } else if (e.code === 'KeyR') {
        if (this.state === 'GAMEOVER' || this.state === 'PAUSED') {
          e.preventDefault();
          this.startGame();
        }
      }
    });

    // 2. Clique / Toque no Canvas e Botão Móvel
    this.dom.mobileJumpBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.handleJump();
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.state === 'PLAYING') {
        this.handleJump();
      }
    });

    // 3. Botões de Navegação & HUD
    this.dom.btnPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.startGame();
    });

    this.dom.btnHowToPlay.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.modalInstructions.classList.remove('hidden');
    });

    this.dom.btnCloseInstructions.addEventListener('click', () => {
      this.audio.playClick();
      this.dom.modalInstructions.classList.add('hidden');
    });

    this.dom.btnSoundToggle.addEventListener('click', () => {
      const enabled = this.audio.toggle();
      this.updateSoundIcon();
    });

    this.dom.btnPauseToggle.addEventListener('click', () => {
      this.audio.playClick();
      this.togglePause();
    });

    this.dom.btnResume.addEventListener('click', () => {
      this.audio.playClick();
      this.togglePause();
    });

    this.dom.btnRestartPause.addEventListener('click', () => {
      this.audio.playClick();
      this.startGame();
    });

    this.dom.btnTryAgain.addEventListener('click', () => {
      this.audio.playClick();
      this.startGame();
    });

    this.dom.btnMenu.addEventListener('click', () => {
      this.audio.playClick();
      this.showScreen('start');
    });
  }

  handleJump() {
    if (this.state === 'PLAYING') {
      if (this.player.jump()) {
        this.audio.playJump();
        this.particles.addDust(this.player.x + 15, this.groundY);
      }
    } else if (this.state === 'START') {
      this.startGame();
    } else if (this.state === 'GAMEOVER') {
      this.startGame();
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.lives = 3;
    this.distance = 0;
    this.bananasCollected = 0;
    this.score = 0;
    this.currentSpeed = this.baseSpeed;

    this.player.reset();
    this.girlfriend.reset();
    this.obstacles.reset();
    this.bananas.reset();
    this.particles.reset();

    this.showScreen('game');
    this.updateHUD();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.dom.screenPause.classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.dom.screenPause.classList.add('hidden');
    }
  }

  triggerDamage() {
    this.lives--;
    this.player.invulnerableTime = 75; // ~1.25 segundos de invulnerabilidade
    this.audio.playHit();
    this.particles.addHitSparks(this.player.x + 25, this.player.y + 30);

    // Efeito de tela piscando vermelho
    this.dom.damageFlash.classList.remove('hidden');
    setTimeout(() => {
      this.dom.damageFlash.classList.add('hidden');
    }, 280);

    // A namorada se aproxima com urgência!
    this.girlfriend.bringCloser();

    this.updateHUD();

    if (this.lives <= 0) {
      this.triggerGameOver();
    }
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    this.player.isDead = true;
    this.player.vy = -8; // Pulinho de derrota
    this.audio.playGameOver();

    // Salvar Recorde
    let isNewRecord = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highDistance = Math.floor(this.distance);
      localStorage.setItem('fuga_macaco_high_score', this.highScore.toString());
      localStorage.setItem('fuga_macaco_high_distance', this.highDistance.toString());
      isNewRecord = true;
    }

    // Exibir dados na tela de Game Over
    setTimeout(() => {
      this.dom.gameoverScore.textContent = this.score.toString().padStart(4, '0');
      this.dom.gameoverDistance.textContent = `${Math.floor(this.distance)}m`;
      this.dom.gameoverBananas.textContent = this.bananasCollected;
      
      const randomQuote = this.funnyQuotes[Math.floor(Math.random() * this.funnyQuotes.length)];
      this.dom.gameoverQuote.textContent = randomQuote;

      if (isNewRecord && this.score > 0) {
        this.dom.newRecordBadge.classList.remove('hidden');
      } else {
        this.dom.newRecordBadge.classList.add('hidden');
      }

      this.showScreen('gameover');
      this.dom.startRecordScore.textContent = this.highScore;
      this.dom.startRecordDist.textContent = `${this.highDistance}m`;
    }, 600);
  }

  updateHUD() {
    this.dom.hudScore.textContent = this.score.toString().padStart(4, '0');
    this.dom.hudDistance.textContent = `${Math.floor(this.distance)}m`;

    // Atualizar corações
    this.dom.hearts.forEach((h, index) => {
      if (index < this.lives) {
        h.classList.add('active');
        h.classList.remove('lost');
      } else {
        h.classList.remove('active');
        h.classList.add('lost');
      }
    });

    // Atualizar barra de perigo
    const threatPct = this.girlfriend.getDangerPercent();
    this.dom.threatBarFill.style.width = `${threatPct}%`;

    // Vinheta de perigo quando a namorada estiver muito perto
    if (this.state === 'PLAYING' && threatPct >= 75) {
      this.dom.dangerOverlay.classList.remove('hidden');
    } else {
      this.dom.dangerOverlay.classList.add('hidden');
    }
  }

  showScreen(name) {
    this.dom.screenStart.classList.add('hidden');
    this.dom.modalInstructions.classList.add('hidden');
    this.dom.screenPause.classList.add('hidden');
    this.dom.screenGameOver.classList.add('hidden');
    this.dom.hud.classList.add('hidden');
    this.dom.mobileJumpBtn.classList.add('hidden');

    if (name === 'start') {
      this.state = 'START';
      this.dom.screenStart.classList.remove('hidden');
    } else if (name === 'game') {
      this.dom.hud.classList.remove('hidden');
      this.dom.mobileJumpBtn.classList.remove('hidden');
    } else if (name === 'gameover') {
      this.dom.screenGameOver.classList.remove('hidden');
    }
  }

  // Detecção de colisão AABB
  checkAABBCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  gameLoop(timestamp) {
    // Cálculo do Delta Time para suavidade
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(32, timestamp - this.lastTime);
    this.lastTime = timestamp;

    // Atualização Lógica
    if (this.state === 'PLAYING') {
      // 1. Progresso e Dificuldade
      this.distance += (this.currentSpeed * 0.05);
      this.score = Math.floor(this.distance) + (this.bananasCollected * 10);

      // Aumento gradual da velocidade conforme distância avança
      this.currentSpeed = this.baseSpeed + Math.min(6.5, this.distance * 0.0035);

      // 2. Atualizar Parallax
      this.bg.update(this.currentSpeed);

      // 3. Atualizar Macaco e Namorada
      this.player.update(this.particles);
      this.girlfriend.update(this.player.x, this.particles, true);

      // Checar se a namorada alcançou o macaco
      if (this.girlfriend.hasCaughtMonkey()) {
        this.triggerGameOver();
      }

      // 4. Atualizar Obstáculos
      this.obstacles.update(this.currentSpeed);

      // Colisão Jogador com Obstáculos
      if (this.player.invulnerableTime <= 0) {
        const playerHitbox = this.player.getHitbox();
        for (let obs of this.obstacles.obstacles) {
          const obsHitbox = {
            x: obs.x + 4,
            y: obs.y + 4,
            width: obs.width - 8,
            height: obs.height - 6
          };
          if (this.checkAABBCollision(playerHitbox, obsHitbox)) {
            this.triggerDamage();
            break;
          }
        }
      }

      // 5. Atualizar e Coletar Bananas
      this.bananas.update(this.currentSpeed);
      const playerHitbox = this.player.getHitbox();
      for (let i = this.bananas.bananas.length - 1; i >= 0; i--) {
        const b = this.bananas.bananas[i];
        // Distância euclidiana simples para coleta
        const dx = (playerHitbox.x + playerHitbox.width / 2) - b.x;
        const dy = (playerHitbox.y + playerHitbox.height / 2) - b.baseY;
        const dist = Math.hypot(dx, dy);

        if (dist < 38) {
          this.bananasCollected++;
          this.audio.playBanana();
          this.particles.addBananaSparkles(b.x, b.baseY);
          this.bananas.bananas.splice(i, 1);
        }
      }

      // 6. Atualizar Partículas e HUD
      this.particles.update();
      this.updateHUD();

    } else if (this.state === 'START') {
      // Movimento suave do fundo e animação parada do macaco na tela de menu
      this.bg.update(1.2);
      this.player.update(this.particles);
      this.particles.update();
    } else if (this.state === 'GAMEOVER') {
      this.player.update(this.particles);
      this.particles.update();
    }

    // Renderização
    this.render();

    // Próximo Frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  render() {
    this.ctx.clearRect(0, 0, this.nativeWidth, this.nativeHeight);

    // 1. Fundo Parallax
    this.bg.draw(this.ctx);

    // 2. Bananas
    this.bananas.draw(this.ctx);

    // 3. Obstáculos
    this.obstacles.draw(this.ctx);

    // 4. Namorada Correndo atrás
    if (this.state === 'PLAYING' || this.state === 'GAMEOVER') {
      this.girlfriend.draw(this.ctx);
    }

    // 5. Macaco
    this.player.draw(this.ctx);

    // 6. Partículas e Efeitos de Texto
    this.particles.draw(this.ctx);
  }
}

// Inicialização automática quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});
