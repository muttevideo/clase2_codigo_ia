/**
 * ============================================================================
 * MUTTEVIDEO // PORTFOLIO EXPERIMENTAL & SISTEMAS GENERATIVOS
 * Archivo de Lógica Interactiva (script.js)
 * Paleta: Turquesa, Violeta, Magenta, Amarillo, Blanco y Negro
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 01. CONFIGURACIÓN GLOBAL & ESTADO DEL SISTEMA
  // --------------------------------------------------------------------------
  const STATE = {
    mode: 'vector', // 'vector', 'neural', 'vortex', 'quantum'
    chaos: 1.25,
    speed: 1.0,
    targetParticleCount: 650,
    palette: 'cyber',
    seed: Math.random() * 1000,
    time: 0,
    mouse: {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      isDown: false,
      hasMoved: false,
      radius: 160
    },
    audioEnabled: false,
    fps: 60,
    lastFrameTime: performance.now(),
    frameCount: 0
  };

  // Paletas Cromáticas de Vanguardia (Turquesa, Violeta, Magenta, Amarillo, Blanco y Negro)
  const PALETTES = {
    cyber: ['#00f5d4', '#f72585', '#ffd600', '#8a2be2'],    // Turquesa, Magenta, Amarillo, Violeta
    spectral: ['#00f5d4', '#8a2be2', '#ffffff', '#050508'], // Turquesa, Violeta, Blanco, Negro
    aurora: ['#ffd600', '#f72585', '#00f5d4', '#ffffff'],   // Amarillo, Magenta, Turquesa, Blanco
    monochrome: ['#ffffff', '#8a2be2', '#00f5d4', '#050508']// Blanco, Violeta, Turquesa, Negro
  };

  // Base de datos de proyectos para inspección
  const PROJECTS_DATA = [
    {
      id: 0,
      title: 'Symbio-Génesis // Vínculos de Micelio Sintético',
      year: '2026',
      venue: 'Sónar+D & MUTEK Barcelona',
      category: 'Instalación A/V Bio-computacional',
      description: 'Una arquitectura viva conectada a electrodos microcelulares que miden la impedancia biológica de micelio fúngico. Los pulsos bioeléctricos modulan osciladores de síntesis granular y deforman en directo una nube de 100.000 partículas proyectada sobre una membrana de seda transpirable.',
      tech: ['TouchDesigner', 'Bio-sensores Arduino', 'Síntesis Granular', 'OpenGL / GLSL', 'Micelio Pleurotus'],
      metrics: 'Latencia: 4ms • Canales bioeléctricos: 16 • Frecuencia: 0.1Hz - 45Hz'
    },
    {
      id: 1,
      title: 'Resonancia Latente // Topologías del Sueño Artificial',
      year: '2025',
      venue: 'Ars Electronica Festival, Linz (Mención de Honor)',
      category: 'Arte Generativo & Redes Neuronales',
      description: 'Investigación sobre las alucinaciones de autoencoders variacionales al interpolar entre millones de imágenes satelitales geológicas y resonancias magnéticas cerebrales. La pieza genera un paisaje topográfico infinito que muta en armonía con una composición sonora de ondas binaurales.',
      tech: ['PyTorch', 'VAE Latent Walk', 'Three.js / WebGL', 'Max/MSP', 'Shaders de Deformación'],
      metrics: 'Dimensiones latentes: 512 • Mapeo volumétrico: 4K HDR • Escala: Continua'
    },
    {
      id: 2,
      title: 'Hyper-Soma // Coreografías de la Desmaterialización',
      year: '2025',
      venue: 'ZKM Center for Art and Media, Karlsruhe',
      category: 'Performance XR & Danza Algorítmica',
      description: 'Cuatro cámaras LiDAR de grado industrial rastrean a una bailarina contemporánea en una caja negra. Su masa corporal se reconstruye como un campo de fuerzas vectoriales que colapsa y se regenera a medida que el ritmo cardíaco de la intérprete se sincroniza con el motor físico del espacio.',
      tech: ['Sensores Ouster LiDAR', 'C++ / OpenFrameworks', 'Houdini FX', 'Ableton Link', 'Nube de Puntos'],
      metrics: 'Puntos por frame: 1.2M • Tasa de refresco: 90 FPS • Error espacial: <1.5mm'
    },
    {
      id: 3,
      title: 'Eco-Mutaciones // Archivo de Especies Posibles',
      year: '2024',
      venue: '16ª Bienal de Artes Mediales, Santiago',
      category: 'Robótica Dibujante & Algoritmos Genéticos',
      description: 'Un brazo robótico customizado ejecuta un algoritmo evolutivo que hibrida códigos morfológicos de flora autóctona en peligro de extinción con geometrías cristalinas. Las ilustraciones generadas se graban con láser UV sobre emulsiones vegetales fotosensibles que se degradan con la luz de la sala.',
      tech: ['Brazo KUKA KR6', 'Algoritmos Genéticos', 'Python', 'Emulsión Clorofílica', 'Visión por Computador'],
      metrics: 'Generaciones botánicas: 4.800 • Dibujos creados: 120 • Tiempo degradación: 7 días'
    }
  ];

  // --------------------------------------------------------------------------
  // 02. INICIALIZACIÓN DEL CANVAS GENERATIVO
  // --------------------------------------------------------------------------
  const bgCanvas = document.getElementById('canvas-bg');
  const bgCtx = bgCanvas.getContext('2d');
  let width, height;
  let particles = [];
  let shockwaves = [];

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = width;
    bgCanvas.height = height;
    initParticles();
  }

  // Clase Partícula Generativa
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
      this.y = initial ? Math.random() * height : Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5;
      this.size = Math.random() * 2.2 + 0.6;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.paletteIndex = Math.floor(Math.random() * 4);
      this.life = Math.random() * 200 + 100;
      this.maxLife = this.life;
    }

    update() {
      const pColors = PALETTES[STATE.palette];
      this.color = pColors[this.paletteIndex % pColors.length];

      // Comportamiento según el MODO seleccionado
      const scale = 0.003 * STATE.chaos;
      const angle = (Math.sin(this.x * scale + STATE.seed) + Math.cos(this.y * scale + STATE.seed) + STATE.time * 0.002) * Math.PI * 2;

      if (STATE.mode === 'vector') {
        this.vx += Math.cos(angle) * 0.25 * STATE.speed;
        this.vy += Math.sin(angle) * 0.25 * STATE.speed;
        this.vx *= 0.94;
        this.vy *= 0.94;
      } else if (STATE.mode === 'neural') {
        this.vx += (Math.random() - 0.5) * 0.6 * STATE.speed;
        this.vy += (Math.random() - 0.5) * 0.6 * STATE.speed;
        this.vx *= 0.96;
        this.vy *= 0.96;
      } else if (STATE.mode === 'vortex') {
        const dx = this.x - STATE.mouse.targetX;
        const dy = this.y - STATE.mouse.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const normalX = -dy / dist;
        const normalY = dx / dist;
        const pull = Math.min(2.5, 400 / dist);

        this.vx += (normalX * 1.2 - (dx / dist) * pull * 0.3) * STATE.speed;
        this.vy += (normalY * 1.2 - (dy / dist) * pull * 0.3) * STATE.speed;
        this.vx *= 0.93;
        this.vy *= 0.93;
      } else if (STATE.mode === 'quantum') {
        const distCenter = Math.hypot(this.x - width / 2, this.y - height / 2);
        const wave = Math.sin(distCenter * 0.05 - STATE.time * 0.05 * STATE.speed) * 2;
        this.vx += (Math.cos(wave) * 1.2) * STATE.speed;
        this.vy += (Math.sin(wave) * 1.2) * STATE.speed;
        this.vx *= 0.92;
        this.vy *= 0.92;
      }

      // Interacción con el cursor del mouse
      const mdx = STATE.mouse.targetX - this.x;
      const mdy = STATE.mouse.targetY - this.y;
      const mDist = Math.hypot(mdx, mdy);

      if (mDist < STATE.mouse.radius && mDist > 0) {
        const force = (1 - mDist / STATE.mouse.radius) * 3;
        if (STATE.mouse.isDown) {
          // Atracción gravitatoria al hacer click
          this.vx += (mdx / mDist) * force * 1.5;
          this.vy += (mdy / mDist) * force * 1.5;
        } else {
          // Repulsión ligera con el cursor
          this.vx -= (mdx / mDist) * force * 0.8;
          this.vy -= (mdy / mDist) * force * 0.8;
        }
      }

      // Ondas de choque (Shockwaves)
      for (let sw of shockwaves) {
        const swDist = Math.hypot(this.x - sw.x, this.y - sw.y);
        const diff = Math.abs(swDist - sw.radius);
        if (diff < 40) {
          const push = ((40 - diff) / 40) * sw.intensity;
          const swAngle = Math.atan2(this.y - sw.y, this.x - sw.x);
          this.vx += Math.cos(swAngle) * push;
          this.vy += Math.sin(swAngle) * push;
        }
      }

      this.x += this.vx;
      this.y += this.vy;

      // Límites de pantalla envolventes
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      this.life--;
      if (this.life <= 0) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = STATE.targetParticleCount;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // --------------------------------------------------------------------------
  // 03. MOTOR DE RENDERIZADO DEL CANVAS
  // --------------------------------------------------------------------------
  function renderCanvas() {
    STATE.time++;

    // Desvanecimiento suave para estelas orgánicas
    bgCtx.fillStyle = 'rgba(5, 6, 8, 0.15)';
    bgCtx.fillRect(0, 0, width, height);

    // Actualizar ondas de choque
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += 12 * STATE.speed;
      sw.intensity *= 0.95;

      bgCtx.beginPath();
      bgCtx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      bgCtx.strokeStyle = sw.color;
      bgCtx.lineWidth = Math.max(1, sw.intensity * 2);
      bgCtx.globalAlpha = sw.intensity * 0.4;
      bgCtx.stroke();

      if (sw.intensity < 0.05 || sw.radius > Math.max(width, height) * 0.9) {
        shockwaves.splice(i, 1);
      }
    }

    // Actualizar y renderizar partículas
    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
      particles[i].update();
      particles[i].draw(bgCtx);
    }

    // Enlaces de red en MODO NEURAL
    if (STATE.mode === 'neural') {
      bgCtx.lineWidth = 0.5;
      const maxConnectDist = 65;
      // Comprobar conexiones con un subconjunto para optimizar FPS
      for (let i = 0; i < pLen; i += 3) {
        const p1 = particles[i];
        for (let j = i + 1; j < pLen; j += 6) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < maxConnectDist) {
            bgCtx.beginPath();
            bgCtx.moveTo(p1.x, p1.y);
            bgCtx.lineTo(p2.x, p2.y);
            bgCtx.strokeStyle = p1.color;
            bgCtx.globalAlpha = (1 - dist / maxConnectDist) * 0.25;
            bgCtx.stroke();
          }
        }
      }
    }

    // Telemetría & FPS
    calculateFps();

    requestAnimationFrame(renderCanvas);
  }

  function triggerShockwave(x, y, color) {
    const swColor = color || PALETTES[STATE.palette][0];
    shockwaves.push({
      x: x || STATE.mouse.targetX,
      y: y || STATE.mouse.targetY,
      radius: 10,
      intensity: 1.5,
      color: swColor
    });

    if (STATE.audioEnabled) {
      playChime(600 + Math.random() * 400);
    }
  }

  // --------------------------------------------------------------------------
  // 04. VISUALIZADOR DE ESPECTROGRAMA (Waveform Canvas)
  // --------------------------------------------------------------------------
  const waveCanvas = document.getElementById('waveformCanvas');
  const waveCtx = waveCanvas ? waveCanvas.getContext('2d') : null;

  function renderWaveform() {
    if (!waveCtx) return;
    const w = waveCanvas.width;
    const h = waveCanvas.height;

    waveCtx.fillStyle = 'rgba(5, 7, 10, 0.25)';
    waveCtx.fillRect(0, 0, w, h);

    const centerY = h / 2;
    const points = 60;
    const step = w / points;

    waveCtx.beginPath();
    waveCtx.strokeStyle = PALETTES[STATE.palette][0];
    waveCtx.lineWidth = 2;
    waveCtx.shadowBlur = 10;
    waveCtx.shadowColor = PALETTES[STATE.palette][0];

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      const freq = 0.08 * STATE.chaos;
      const noise = Math.sin(i * freq + STATE.time * 0.08 * STATE.speed) *
                    Math.cos(i * 0.03 - STATE.time * 0.05);
      const amp = (h * 0.35) * (STATE.mouse.isDown ? 1.2 : 0.8);
      const y = centerY + noise * amp;

      if (i === 0) waveCtx.moveTo(x, y);
      else waveCtx.lineTo(x, y);
    }

    waveCtx.stroke();
    waveCtx.shadowBlur = 0;

    requestAnimationFrame(renderWaveform);
  }

  // --------------------------------------------------------------------------
  // 05. SISTEMA DE AUDIO GENERATIVO (Web Audio API)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let masterGain = null;
  let droneOsc1 = null;
  let droneOsc2 = null;
  let filterNode = null;

  function initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.08, audioCtx.currentTime);

      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(320, audioCtx.currentTime);
      filterNode.Q.setValueAtTime(4, audioCtx.currentTime);

      droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'sawtooth';
      droneOsc1.frequency.setValueAtTime(55, audioCtx.currentTime); // Nota A1

      droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(110.5, audioCtx.currentTime); // A2 levemente desafinado

      droneOsc1.connect(filterNode);
      droneOsc2.connect(filterNode);
      filterNode.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      droneOsc1.start();
      droneOsc2.start();

      STATE.audioEnabled = true;
      updateSoundUI(true);
      showToast('PAISAJE SONORO GENERATIVO: CONECTADO');
    } catch (e) {
      console.warn('Web Audio no disponible:', e);
      showToast('ERROR AL INICIALIZAR SISTEMA DE AUDIO');
    }
  }

  function playChime(freq) {
    if (!audioCtx || !STATE.audioEnabled) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (err) {
      // Audio buffer safe catch
    }
  }

  function toggleAudio() {
    if (!audioCtx) {
      initAudio();
      return;
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      STATE.audioEnabled = true;
      updateSoundUI(true);
      showToast('AUDIO REANUDADO');
    } else if (audioCtx.state === 'running') {
      if (STATE.audioEnabled) {
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        STATE.audioEnabled = false;
        updateSoundUI(false);
        showToast('AUDIO SILENCIADO');
      } else {
        masterGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        STATE.audioEnabled = true;
        updateSoundUI(true);
        showToast('AUDIO REACTIVADO');
      }
    }
  }

  function updateSoundUI(isOn) {
    const btn = document.getElementById('soundToggle');
    const icon = document.getElementById('soundIcon');
    const text = btn ? btn.querySelector('.sound-text') : null;

    if (!btn) return;

    if (isOn) {
      btn.classList.add('sound-on');
      if (icon) icon.textContent = '🔊';
      if (text) text.textContent = 'AUDIO: ON';
    } else {
      btn.classList.remove('sound-on');
      if (icon) icon.textContent = '🔇';
      if (text) text.textContent = 'AUDIO: OFF';
    }
  }

  // Modulación continua del filtro de audio con el movimiento del ratón
  function modulateAudioWithCursor(x, y) {
    if (!audioCtx || !STATE.audioEnabled || !filterNode) return;
    const normX = x / width;
    const cutoff = 150 + normX * 1200;
    filterNode.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.08);
  }

  // --------------------------------------------------------------------------
  // 06. HUD, TELEMETRÍA Y CONTADORES
  // --------------------------------------------------------------------------
  const hudFps = document.getElementById('hudFps');
  const hudCoords = document.getElementById('hudCoords');
  const hudParticles = document.getElementById('hudParticles');
  const hudMode = document.getElementById('hudMode');
  const clockDisplay = document.getElementById('clockDisplay');

  function calculateFps() {
    STATE.frameCount++;
    const now = performance.now();
    const delta = now - STATE.lastFrameTime;

    if (delta >= 1000) {
      STATE.fps = Math.round((STATE.frameCount * 1000) / delta);
      STATE.frameCount = 0;
      STATE.lastFrameTime = now;
      if (hudFps) hudFps.textContent = STATE.fps;
    }
  }

  function updateClock() {
    if (!clockDisplay) return;
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    clockDisplay.textContent = `${h}:${m}:${s} UTC`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --------------------------------------------------------------------------
  // 07. CURSOR PERSONALIZADO VANGUARDISTA
  // --------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;

  function updateCustomCursor() {
    if (cursorDot) {
      cursorDot.style.left = `${STATE.mouse.targetX}px`;
      cursorDot.style.top = `${STATE.mouse.targetY}px`;
    }

    if (cursorRing) {
      // Interpolación lineal suave (lerp)
      ringX += (STATE.mouse.targetX - ringX) * 0.18;
      ringY += (STATE.mouse.targetY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }

    requestAnimationFrame(updateCustomCursor);
  }

  // --------------------------------------------------------------------------
  // 08. GESTIÓN DE EVENTOS DE USUARIO
  // --------------------------------------------------------------------------
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  window.addEventListener('mousemove', (e) => {
    STATE.mouse.targetX = e.clientX;
    STATE.mouse.targetY = e.clientY;
    STATE.mouse.hasMoved = true;

    if (hudCoords) {
      const padX = String(Math.floor(e.clientX)).padStart(4, '0');
      const padY = String(Math.floor(e.clientY)).padStart(4, '0');
      hudCoords.textContent = `X:${padX} Y:${padY}`;
    }

    modulateAudioWithCursor(e.clientX, e.clientY);
  });

  window.addEventListener('mousedown', (e) => {
    // Si no es un elemento interactivo que requiere su propio click
    const targetTag = e.target.tagName.toLowerCase();
    if (!['button', 'a', 'input', 'select', 'textarea'].includes(targetTag)) {
      STATE.mouse.isDown = true;
      triggerShockwave(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseup', () => {
    STATE.mouse.isDown = false;
  });

  // Soporte táctil
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      STATE.mouse.targetX = e.touches[0].clientX;
      STATE.mouse.targetY = e.touches[0].clientY;
      if (hudCoords) {
        hudCoords.textContent = `X:${Math.floor(STATE.mouse.targetX)} Y:${Math.floor(STATE.mouse.targetY)}`;
      }
    }
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      STATE.mouse.targetX = e.touches[0].clientX;
      STATE.mouse.targetY = e.touches[0].clientY;
      triggerShockwave(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Detección de elementos interactivos para el cursor
  document.querySelectorAll('a, button, input, textarea, select, .project-card, .swatch-btn, .mode-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // Interactive Hero Preview Area
  const heroArea = document.getElementById('interactiveHeroArea');
  if (heroArea) {
    heroArea.addEventListener('click', (e) => {
      const rect = heroArea.getBoundingClientRect();
      const clickX = e.clientX;
      const clickY = e.clientY;
      triggerShockwave(clickX, clickY, '#00f5d4');
      showToast('REVERBERACIÓN CUÁNTICA DISPARADA');
    });
  }

  // --------------------------------------------------------------------------
  // 09. CONTROLES DEL LABORATORIO GENERATIVO
  // --------------------------------------------------------------------------
  const sliderChaos = document.getElementById('sliderChaos');
  const sliderSpeed = document.getElementById('sliderSpeed');
  const sliderParticles = document.getElementById('sliderParticles');
  const valChaos = document.getElementById('valChaos');
  const valSpeed = document.getElementById('valSpeed');
  const valParticles = document.getElementById('valParticles');
  const panelActiveMode = document.getElementById('panelActiveMode');
  const lblMode = document.getElementById('lblMode');
  const valPalette = document.getElementById('valPalette');

  // Sliders
  if (sliderChaos) {
    sliderChaos.addEventListener('input', (e) => {
      STATE.chaos = parseFloat(e.target.value);
      if (valChaos) valChaos.textContent = STATE.chaos.toFixed(2);
    });
  }

  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', (e) => {
      STATE.speed = parseFloat(e.target.value);
      if (valSpeed) valSpeed.textContent = `${STATE.speed.toFixed(1)}x`;
    });
  }

  if (sliderParticles) {
    sliderParticles.addEventListener('input', (e) => {
      const newCount = parseInt(e.target.value, 10);
      STATE.targetParticleCount = newCount;
      if (valParticles) valParticles.textContent = newCount;
      if (hudParticles) hudParticles.textContent = newCount;
      adjustParticleCount(newCount);
    });
  }

  function adjustParticleCount(target) {
    while (particles.length < target) {
      particles.push(new Particle());
    }
    if (particles.length > target) {
      particles.length = target;
    }
  }

  // Botones de Modo
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');
      STATE.mode = mode;

      const modeNames = {
        vector: 'FLUJO_VECTORIAL',
        neural: 'RED_NEURAL',
        vortex: 'VÓRTICE_GRAVITACIONAL',
        quantum: 'PULSO_CUÁNTICO'
      };

      const displayName = modeNames[mode] || mode.toUpperCase();
      if (hudMode) hudMode.textContent = displayName;
      if (panelActiveMode) panelActiveMode.textContent = `MODO: ${displayName.replace('_', ' ')}`;
      if (lblMode) lblMode.textContent = displayName.replace('_', ' ');

      triggerShockwave(width / 2, height / 2);
      showToast(`MODO ACTIVADO: ${displayName}`);
    });
  });

  // Botones de Paleta
  const swatchButtons = document.querySelectorAll('.swatch-btn');
  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      swatchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const paletteKey = btn.getAttribute('data-palette');
      STATE.palette = paletteKey;

      const paletteNames = {
        cyber: 'CIBERNÉTICA',
        spectral: 'ESPECTRAL',
        aurora: 'SOLAR',
        monochrome: 'CONTRASTE PURO'
      };

      if (valPalette) valPalette.textContent = paletteNames[paletteKey] || paletteKey.toUpperCase();
      showToast(`PALETA SELECCIONADA: ${paletteNames[paletteKey]}`);
    });
  });

  // Acciones: Explosión, Mutar, Capturar
  const btnBurst = document.getElementById('btnBurst');
  if (btnBurst) {
    btnBurst.addEventListener('click', () => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const rx = width * (0.2 + Math.random() * 0.6);
          const ry = height * (0.2 + Math.random() * 0.6);
          triggerShockwave(rx, ry);
        }, i * 140);
      }
      showToast('💥 RUPTURA CINÉTICA DISPARADA');
    });
  }

  const btnRandomize = document.getElementById('btnRandomize');
  if (btnRandomize) {
    btnRandomize.addEventListener('click', () => {
      STATE.seed = Math.random() * 9999;
      // Reubicar aleatoriamente algunas partículas
      particles.forEach(p => {
        if (Math.random() > 0.4) p.reset();
      });
      triggerShockwave(width / 2, height / 2);
      showToast(`🎲 SEMILLA REGENERADA: #${Math.floor(STATE.seed)}`);
    });
  }

  // Exportar fotograma PNG
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportFrameSnapshot();
    });
  }

  function exportFrameSnapshot() {
    try {
      // Creamos un canvas temporal con marca de agua vanguardista
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = bgCanvas.width;
      snapCanvas.height = bgCanvas.height;
      const sCtx = snapCanvas.getContext('2d');

      // Dibujar fondo y partículas actuales
      sCtx.drawImage(bgCanvas, 0, 0);

      // Marca de agua y metadatos
      sCtx.font = '14px "Space Mono", monospace';
      sCtx.fillStyle = '#00f5d4';
      sCtx.fillText(`MUTTEVIDEO // SISTEMAS GENERATIVOS // SEED: ${Math.floor(STATE.seed)} // MODO: ${STATE.mode.toUpperCase()}`, 30, snapCanvas.height - 30);

      const link = document.createElement('a');
      link.download = `muttevideo-generativo-${Date.now()}.png`;
      link.href = snapCanvas.toDataURL('image/png');
      link.click();

      showToast('📸 FOTOGRAMA EXPORTADO CON ÉXITO [PNG]');
    } catch (err) {
      console.error(err);
      showToast('ERROR AL EXPORTAR FOTOGRAMA');
    }
  }

  // --------------------------------------------------------------------------
  // 10. MODAL DE OBRAS / PROYECTOS
  // --------------------------------------------------------------------------
  const projectCards = document.querySelectorAll('.project-card');
  const projectModal = document.getElementById('projectModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalContent = document.getElementById('modalContent');

  function openProjectModal(projectId) {
    const project = PROJECTS_DATA[projectId];
    if (!project || !modalContent) return;

    modalContent.innerHTML = `
      <div class="modal-header-meta">
        <span>AÑO: ${project.year}</span>
        <span>•</span>
        <span>${project.category.toUpperCase()}</span>
      </div>
      <h2 class="modal-title">${project.title}</h2>
      <p class="modal-body-text">${project.description}</p>
      
      <div class="modal-tech-specs">
        <h4 class="specs-title">ESPECIFICACIONES TÉCNICAS &amp; EXPOSICIÓN</h4>
        <div class="specs-grid">
          <div><strong>Premiere:</strong> ${project.venue}</div>
          <div><strong>Métricas:</strong> ${project.metrics}</div>
        </div>
        <div style="margin-top: 14px;">
          <strong style="color: var(--text-muted); font-size: 0.75rem;">STACK COMPUTACIONAL:</strong>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
            ${project.tech.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    if (projectModal) {
      projectModal.classList.add('active');
      projectModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('active');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const pId = parseInt(card.getAttribute('data-project'), 10);
      openProjectModal(pId);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
  });

  // --------------------------------------------------------------------------
  // 11. FORMULARIO DE TRANSMISIÓN / CONTACTO
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.btn-submit');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-text">CIFRANDO SEÑAL...</span>';
      }

      setTimeout(() => {
        if (formStatus) {
          formStatus.textContent = '✓ TRANSMISIÓN ENCRIPTADA RECIBIDA EN SERVIDOR SEGURO';
        }
        showToast('⚡ TRANSMISIÓN ENVIADA AL ESTUDIO');
        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        setTimeout(() => {
          if (formStatus) formStatus.textContent = '';
        }, 5000);
      }, 900);
    });
  }

  // --------------------------------------------------------------------------
  // 12. TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `[SYS] ${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // 13. NAVEGACIÓN ACTIVA EN SCROLL & SONIDO
  // --------------------------------------------------------------------------
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', toggleAudio);
  }

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 14. ARRANQUE DEL SISTEMA
  // --------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    renderCanvas();
    renderWaveform();
    updateCustomCursor();

    // Mensaje de bienvenida en consola al estilo vanguardista
    console.log(
      '%c [MUTTEVIDEO // ARTE MULTIMEDIAL & SISTEMAS GENERATIVOS] %c 2026 ',
      'background: #00f5d4; color: #050508; font-weight: bold; padding: 4px;',
      'background: #f72585; color: #fff; padding: 4px;'
    );
  });

})();
