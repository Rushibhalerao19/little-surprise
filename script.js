// background floating hearts
const heartsBg = document.getElementById('heartsBg');
const heartEmojis = ['💗', '🌸', '♡', '🌷'];
for (let i = 0; i < 14; i++) {
  const s = document.createElement('span');
  s.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 100 + '%';
  s.style.animationDelay = (Math.random() * 6) + 's';
  s.style.animationDuration = (7 + Math.random() * 5) + 's';
  heartsBg.appendChild(s);
}

const openBtn = document.getElementById('openBtn');
const quizCard = document.getElementById('quizCard');
const dotsWrap = document.getElementById('dots');
const totalQ = 4;
let current = 1;

for (let i = 1; i <= totalQ; i++) {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 1 ? ' active' : '');
  d.id = 'dot' + i;
  dotsWrap.appendChild(d);
}

openBtn.addEventListener('click', () => {
  quizCard.classList.add('show');
  openBtn.style.display = 'none';
});

function updateDots(n) {
  for (let i = 1; i <= totalQ; i++) {
    document.getElementById('dot' + i).classList.toggle('active', i === n);
  }
}

const yesAudio = document.getElementById('yesSound');
const noAudio = document.getElementById('noSound');

function playSound(el) {
  // stop whichever sound is currently playing, then play the requested one
  [yesAudio, noAudio].forEach(a => {
    if (a !== el) { a.pause(); a.currentTime = 0; }
  });
  el.currentTime = 0;
  el.play().catch(() => { });
}

function goToNext(q) {
  document.getElementById('q' + q).style.display = 'none';
  if (q < totalQ) {
    current = q + 1;
    document.getElementById('q' + current).style.display = 'block';
    updateDots(current);
  } else {
    quizCard.querySelector('.progress-dots').style.display = 'none';
    document.getElementById('finale').classList.add('show');
    launchFlowers();
  }
}

document.querySelectorAll('.btn-yes').forEach(btn => {
  btn.addEventListener('click', () => {
    const q = parseInt(btn.dataset.q);
    playSound(yesAudio);
    goToNext(q);
  });
});

// dodge behaviour for "No" buttons — flees from the cursor in real time
// (tracked continuously via mousemove), so the cursor can never actually land on it
const DODGE_RADIUS = 110; // px — how close the cursor can get before it flees
const fleeState = new Map();

document.querySelectorAll('.btn-no').forEach(btn => {
  fleeState.set(btn, { fleeing: false });
});

document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.btn-no').forEach(btn => {
    const card = btn.closest('.card');
    if (!card || getComputedStyle(card).display === 'none') return;

    const bRect = btn.getBoundingClientRect();
    const cx = bRect.left + bRect.width / 2;
    const cy = bRect.top + bRect.height / 2;

    const dx = cx - e.clientX;
    const dy = cy - e.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const state = fleeState.get(btn);

    if (dist < DODGE_RADIUS) {
      if (!state.fleeing) {
        state.fleeing = true;
        playSound(noAudio);
      }
      fleeFrom(btn, e.clientX, e.clientY);
    } else if (state.fleeing && dist > DODGE_RADIUS * 1.6) {
      state.fleeing = false;
      btn.classList.remove('dodging');
      btn.style.left = '0px';
      btn.style.top = '0px';
    }
  });
});

function fleeFrom(btn, cursorX, cursorY) {
  const card = document.getElementById('quizCard');
  const cardRect = card.getBoundingClientRect();
  const bRect = btn.getBoundingClientRect();
  const padding = 20;

  const currentLeft = parseFloat(btn.style.left) || 0;
  const currentTop = parseFloat(btn.style.top) || 0;

  // neutral (un-offset) position of the button
  const neutralLeft = bRect.left - currentLeft;
  const neutralTop = bRect.top - currentTop;

  const minX = (cardRect.left + padding) - neutralLeft;
  const maxX = (cardRect.right - padding - bRect.width) - neutralLeft;
  const minY = (cardRect.top + padding) - neutralTop;
  const maxY = (cardRect.bottom - padding - bRect.height) - neutralTop;

  const cx = bRect.left + bRect.width / 2;
  const cy = bRect.top + bRect.height / 2;

  // direction away from the cursor
  let dx = cx - cursorX;
  let dy = cy - cursorY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  dx /= len; dy /= len;

  // a little randomness so it doesn't feel robotic
  dx += (Math.random() - 0.5) * 0.4;
  dy += (Math.random() - 0.5) * 0.4;

  const jump = 130;
  let newX = currentLeft + dx * jump;
  let newY = currentTop + dy * jump;

  newX = Math.max(minX, Math.min(newX, maxX));
  newY = Math.max(minY, Math.min(newY, maxY));

  const wiggle = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 6);
  btn.style.setProperty('--wiggle', wiggle + 'deg');
  btn.classList.add('dodging');
  btn.style.left = newX + 'px';
  btn.style.top = newY + 'px';
}

function launchFlowers() {
  const shower = document.createElement('div');
  shower.className = 'flower-shower';
  document.body.appendChild(shower);

  const emojis = ['🌸', '🌺', '🌷', '💐', '🌼', '💮'];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight / 2;
  const count = 40;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 160 + Math.random() * 260;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 60; // slight upward bias

    petal.style.left = originX + 'px';
    petal.style.top = originY + 'px';
    petal.style.setProperty('--dx', dx + 'px');
    petal.style.setProperty('--dy', dy + 'px');
    petal.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    petal.style.animationDelay = (Math.random() * 0.15) + 's';

    shower.appendChild(petal);
  }

  setTimeout(() => { shower.remove(); }, 1600);
}
