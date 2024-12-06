const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resultDiv = document.getElementById('captchaResult');
const validateButton = document.getElementById('validateButton');
const continueButton = document.getElementById('continueButton');

canvas.width = 800;
canvas.height = 400;

// Initial dimensions (will update with image sizes)
let boatWidth = 110;
let boatHeight = 70;
let trashWidth = 150;
let trashHeight = 150;

// Hitbox dimensions (percentage of image size)
const hitboxScale = 0.8; // 80% of the image size for hitbox

// Images
const boatImage = new Image();
boatImage.src = 'boat.png';

const trashImage = new Image();
trashImage.src = 'trash.png';

const backgroundImage = new Image();
backgroundImage.src = 'background.jpg'; // Image de fond

// Positions
const player = { x: 0, y: canvas.height / 2 - boatHeight / 2 };
const bot = { x: canvas.width - boatWidth, y: canvas.height / 2 - boatHeight / 2 };
const trash = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4 };

let playerDirection = 0;

// Particles for trails
const particles = [];

let score = 0; // Score initial

function createParticle(x, y, isWhite, dx, dy) {
  particles.push({
    x,
    y,
    alpha: 1,
    radius: Math.random() * 5 + 2,
    color: isWhite
      ? `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})` // Blanc semi-transparent
      : `rgba(0, ${Math.random() * 100 + 150}, 255, ${Math.random() * 0.5 + 0.3})`, // Bleu variable
    dx,
    dy,
  });
}

function updateParticles() {
  particles.forEach((particle, index) => {
    particle.alpha -= 0.02;
    particle.x += particle.dx;
    particle.y += particle.dy;
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
  });
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// Imperfections for the bot
const botMaxSpeed = 4;
const botTrackingSpeed = 0.1;
const botMaxError = 30;

// Event listeners
window.addEventListener('keydown', (e) => {
  if (e.key === 'z' || e.key === 'Z') playerDirection = -5;
  if (e.key === 's' || e.key === 'S') playerDirection = 5;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'z' || e.key === 'Z' || e.key === 's' || e.key === 'S') playerDirection = 0;
});

function getHitbox(x, y, width, height, scale) {
  const scaledWidth = height * scale + 5;
  const scaledHeight = width * scale + 5;
  return {
    x: x + (width - scaledWidth) / 2, // Center the hitbox horizontally
    y: y + (height - scaledHeight) / 2, // Center the hitbox vertically
    width: scaledWidth,
    height: scaledHeight,
  };
}

function isCollision(hitboxA, hitboxB) {
  return (
    hitboxA.x < hitboxB.x + hitboxB.width &&
    hitboxA.x + hitboxA.width > hitboxB.x &&
    hitboxA.y < hitboxB.y + hitboxB.height &&
    hitboxA.y + hitboxA.height > hitboxB.y
  );
}

function update() {
  // Move player boat
  player.y += playerDirection;
  player.y = Math.max(Math.min(player.y, canvas.height - boatHeight), 0);

  // Add player trail at the back of the boat
  createParticle(
    player.x + boatWidth / 2, // Position arrière du bateau
    player.y + boatHeight,    // Aligné avec l'arrière
    Math.random() > 0.5,
    0,                        // Pas de mouvement latéral
    2                         // Particules descendantes
  );

  // Move bot
  const botCenter = bot.y + boatHeight / 2;
  const distanceToTrash = Math.abs(trash.y - botCenter);
  const botSpeed = Math.min(botMaxSpeed, distanceToTrash * botTrackingSpeed);

  if (trash.y > botCenter + botMaxError) {
    bot.y += botSpeed;
  } else if (trash.y < botCenter - botMaxError) {
    bot.y -= botSpeed;
  }

  bot.y = Math.max(Math.min(bot.y, canvas.height - boatHeight), 0);

  // Add bot trail at the back of the boat
  createParticle(
    bot.x + boatWidth / 2,    // Position arrière du bateau
    bot.y + boatHeight,       // Aligné avec l'arrière
    Math.random() > 0.5,
    0,                        // Pas de mouvement latéral
    -2                        // Particules montantes
  );

  // Move trash
  trash.x += trash.dx;
  trash.y += trash.dy;

  // Add trash trail
  createParticle(
    trash.x + trashWidth / 2,
    trash.y + trashHeight / 2,
    Math.random() > 0.5,
    trash.dx * 0.5,
    trash.dy * 0.5
  );

  // Trash wall collision
  if (trash.y <= 0 || trash.y >= canvas.height - trashHeight) trash.dy *= -1;

  // Get hitboxes
  const playerHitbox = getHitbox(player.x, player.y, boatWidth, boatHeight, hitboxScale);
  const botHitbox = getHitbox(bot.x, bot.y, boatWidth, boatHeight, hitboxScale);
  const trashHitbox = getHitbox(trash.x, trash.y, trashWidth, trashHeight, hitboxScale);

  // Trash player collision
  if (isCollision(playerHitbox, trashHitbox)) {
    trash.dx *= -1.1;
    trash.dy *= 1.05;
    score += 1; // Ajoute 5 points lorsque le joueur récupère les déchets
  }

  // Trash bot collision
  if (isCollision(botHitbox, trashHitbox)) {
    trash.dx *= -1.1;
    trash.dy *= 1.05;
    score += 1; // Ajoute 5 points lorsque l'IA récupère les déchets
  }

  // Trash out of bounds
  if (trash.x < 0 || trash.x > canvas.width) {
    score = 0; // Réinitialiser le score si les déchets sortent du cadre
    resetTrash();
  }

  // Check victory
  if (score >= 10) {
    //resultDiv.textContent = '🎉 You Win! 🎉';
    resultDiv.style.display = 'block';
    validateButton.style.display = 'block'; // Affiche le bouton Valider
    continueButton.style.display = 'block'; // Affiche le bouton Continuer
  }

  updateParticles();
}

function resetTrash() {
  trash.x = canvas.width / 2;
  trash.y = canvas.height / 2;
  trash.dx = Math.random() < 0.5 ? 4 : -4;
  trash.dy = (Math.random() * 2 - 1) * 4;
}

function draw() {
  // Dessiner l'image de fond
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

  // Dessiner les particules
  drawParticles();

  // Dessiner le score
  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 20, 40); // Afficher le score dans le coin supérieur gauche

  // Dessiner le bateau du joueur (rotation)
  ctx.save();
  ctx.translate(player.x + boatWidth / 2, player.y + boatHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.drawImage(boatImage, -boatWidth / 2, -boatHeight / 2, boatWidth, boatHeight);
  ctx.restore();

  // Dessiner le bateau de l'IA (rotation)
  ctx.save();
  ctx.translate(bot.x + boatWidth / 2, bot.y + boatHeight / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(boatImage, -boatWidth / 2, -boatHeight / 2, boatWidth, boatHeight);
  ctx.restore();

  // Dessiner les déchets
  ctx.drawImage(trashImage, trash.x, trash.y, trashWidth * 1.5, trashHeight * 1.5);
}

// Bouton Valider - Retourne à la page précédente
validateButton.addEventListener('click', () => {
  window.history.back(); // Retour à la page précédente
});

// Bouton Continuer - Redémarre le jeu
continueButton.addEventListener('click', () => {
  score = 0; // Réinitialise le score
  resultDiv.style.display = 'none'; // Cache le message de victoire
  validateButton.style.display = 'none'; // Cache le bouton Valider
  continueButton.style.display = 'none'; // Cache le bouton Continuer
  gameLoop(); // Redémarre le jeu
});

let gameLoopId;
function gameLoop() {
  update();
  draw();
  gameLoopId = requestAnimationFrame(gameLoop);
}

let imagesLoaded = 0;
function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) { // On attend que toutes les images soient chargées
    // Mettre à jour les dimensions des objets avec la taille des images
    boatWidth = boatImage.width;
    boatHeight = boatImage.height;
    trashWidth = trashImage.width;
    trashHeight = trashImage.height;

    gameLoop();
  }
}

boatImage.onload = checkImagesLoaded;
trashImage.onload = checkImagesLoaded;
backgroundImage.onload = checkImagesLoaded;
