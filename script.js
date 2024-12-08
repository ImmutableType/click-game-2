// Game elements and state
let score = 0;
let gameActive = false;
let clickCount = 0;
let totalTipsReceived = 0;
let treasuryBalance = 0;
let lifetimePoints = 0;

// DOM elements
const scoreDisplay = document.getElementById('score');
const clickButton = document.getElementById('clickButton');
const guestPlayButton = document.getElementById('guestPlayButton');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const personalScores = document.getElementById('personalScores');
const treasuryDisplay = document.getElementById('treasuryBalance');
const tipsDisplay = document.getElementById('totalTips');
const lifetimeDisplay = document.getElementById('playerBalance');
const tipBtn = document.getElementById('tipBtn');
const welcomeMessage = document.getElementById('welcomeMessage');

// Load saved economic data
const loadEconomicData = () => {
   treasuryBalance = parseInt(localStorage.getItem('treasuryBalance')) || 0;
   totalTipsReceived = parseInt(localStorage.getItem('totalTipsReceived')) || 0;
   lifetimePoints = parseInt(localStorage.getItem('lifetimePoints')) || 0;
   updateEconomicDisplays();
};

// Save economic data
const saveEconomicData = () => {
   localStorage.setItem('treasuryBalance', treasuryBalance);
   localStorage.setItem('totalTipsReceived', totalTipsReceived);
   localStorage.setItem('lifetimePoints', lifetimePoints);
};

// Update economic displays
const updateEconomicDisplays = () => {
   treasuryDisplay.textContent = `Treasury Points TV: ${treasuryBalance}`;
   tipsDisplay.textContent = `Paperboy Tips Received TV: ${totalTipsReceived}`;
   lifetimeDisplay.textContent = `Your Lifetime Point Balance: ${lifetimePoints}`;
};

// Generate a random guest ID
function generateGuestId() {
   return 'guest_' + Math.random().toString(36).substr(2, 9);
}

function getRandomPoints() {
   return Math.floor(Math.random() * 10) + 1;
}

function getFirstPlayDate() {
   return localStorage.getItem('firstPlayDate') || new Date().toDateString();
}

function calculateDaysPlayedRatio() {
   const firstPlay = new Date(getFirstPlayDate());
   const today = new Date();
   const daysSinceFirst = Math.floor((today - firstPlay) / (1000 * 60 * 60 * 24)) + 1;
   const daysPlayed = (JSON.parse(localStorage.getItem('myScores') || '[]').length) + 1;
   return `${daysPlayed}/${daysSinceFirst}`;
}

// Game state checks
function canPlayToday() {
   const lastPlayed = localStorage.getItem('lastPlayed');
   const today = new Date().toDateString();
   return lastPlayed !== today;
}

function startNewGame() {
   if (!canPlayToday()) {
       clickButton.disabled = true;
       clickButton.textContent = "Come back tomorrow!";
       return false;
   }
   
   score = 0;
   clickCount = 0;
   gameActive = true;
   updateDisplays();
   clickButton.disabled = false;
   clickButton.textContent = "Click Me!";
   tipBtn.disabled = true;
   return true;
}

function updateDisplays() {
   scoreDisplay.textContent = `Game Score: ${score}`;
   updateEconomicDisplays();
}

function updateWelcomeMessage(username) {
   welcomeMessage.textContent = `Welcome, ${username}`;
}

function createFireworks() {
   for (let i = 0; i < 5; i++) {
       setTimeout(() => {
           const firework = document.createElement('div');
           firework.className = 'firework';
           document.body.appendChild(firework);
           
           setTimeout(() => {
               firework.remove();
           }, 1000);
       }, i * 200);
   }
}

function showHearts() {
   const hearts = document.createElement('div');
   hearts.className = 'hearts-animation';
   hearts.innerHTML = '❤️'.repeat(5);
   document.querySelector('.game-container').appendChild(hearts);
   setTimeout(() => hearts.remove(), 2000);
}

// Handle tip functionality
function handleTip() {
   if (!gameActive && score > 0) {
       const tipAmount = Math.floor(score * 0.1);
       totalTipsReceived += tipAmount;
       score -= tipAmount;
       lifetimePoints -= tipAmount;
       
       showHearts();
       tipBtn.disabled = true;
       updateDisplays();
       saveEconomicData();
       
       if (localStorage.getItem('token')) {
           saveTransaction({
               date: new Date(),
               type: 'tip',
               amount: tipAmount
           });
       }
   }
}

// Handle guest play
guestPlayButton.addEventListener('click', () => {
   const guestId = generateGuestId();
   localStorage.setItem('playerId', guestId);
   updateWelcomeMessage(guestId);
   guestPlayButton.textContent = 'Playing as Guest';
   guestPlayButton.disabled = true;
   startNewGame();
});

// Authentication handlers
loginButton.addEventListener('click', async () => {
   const username = prompt('Enter username:');
   const password = prompt('Enter password:');
   
   if (await login(username, password)) {
       alert('Login successful!');
       loginButton.style.display = 'none';
       registerButton.style.display = 'none';
       guestPlayButton.style.display = 'none';
       updateWelcomeMessage(username);
       loadEconomicData();
       startNewGame();
   } else {
       alert('Login failed. Please try again.');
   }
});

registerButton.addEventListener('click', async () => {
   const username = prompt('Choose a username:');
   const password = prompt('Choose a password:');
   
   if (await register(username, password)) {
       alert('Registration successful!');
       loginButton.style.display = 'none';
       registerButton.style.display = 'none';
       guestPlayButton.style.display = 'none';
       updateWelcomeMessage(username);
       startNewGame();
   } else {
       alert('Registration failed. Please try again.');
   }
});

function endGame() {
   gameActive = false;
   clickButton.disabled = true;
   clickButton.textContent = "Game Over - Come back tomorrow!";
   
   // Add final score to lifetime points
   lifetimePoints += score;
   saveEconomicData();
   
   localStorage.setItem('lastPlayed', new Date().toDateString());
   saveScore(score);
   createFireworks();
   updateDisplays();
   
   // Enable tip button after game
   tipBtn.disabled = false;
}

// Score handling functions
function saveScore(finalScore) {
   let scores = JSON.parse(localStorage.getItem('myScores') || '[]');
   
   if (!localStorage.getItem('firstPlayDate')) {
       localStorage.setItem('firstPlayDate', new Date().toDateString());
   }
   
   scores.push({
       score: finalScore,
       date: new Date().toLocaleDateString(),
       daysPlayedRatio: calculateDaysPlayedRatio()
   });
   
   scores.sort((a, b) => b.score - a.score);
   scores = scores.slice(0, 5);
   localStorage.setItem('myScores', JSON.stringify(scores));
   displayPersonalScores();
}

async function saveTransaction(transaction) {
   try {
       await fetch('/api/transactions', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`
           },
           body: JSON.stringify(transaction)
       });
   } catch (err) {
       console.error('Transaction error:', err);
   }
}

async function register(username, password) {
   try {
       const response = await fetch('/api/auth/register', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({ username, password })
       });
       const data = await response.json();
       if (response.ok) {
           localStorage.setItem('token', data.token);
           localStorage.setItem('username', data.username);
           return true;
       }
       return false;
   } catch (err) {
       console.error('Registration error:', err);
       return false;
   }
}

async function login(username, password) {
   try {
       const response = await fetch('/api/auth/login', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({ username, password })
       });
       const data = await response.json();
       if (response.ok) {
           localStorage.setItem('token', data.token);
           localStorage.setItem('username', data.username);
           return true;
       }
       return false;
   } catch (err) {
       console.error('Login error:', err);
       return false;
   }
}

function displayPersonalScores() {
   const scores = JSON.parse(localStorage.getItem('myScores') || '[]');
   if (scores.length === 0) {
       personalScores.innerHTML = '<div class="score-entry">No scores yet - start clicking!</div>';
   } else {
       personalScores.innerHTML = scores.map((entry, index) => `
           <div class="score-entry">
               #${index + 1}: ${entry.score} points (${entry.date}) - Days Played: ${entry.daysPlayedRatio}
           </div>
       `).join('');
   }
}

// Main game click handler with simplified treasury
clickButton.addEventListener('click', () => {
   if (!gameActive) return;
   
   const pointsEarned = getRandomPoints();
   
   // Player gets full points
   score += pointsEarned;
   
   // Simple treasury addition
   treasuryBalance += Math.floor(pointsEarned * 0.10);
   
   // Direct display updates
   scoreDisplay.textContent = `Game Score: ${score}`;
   treasuryDisplay.textContent = `Treasury Points TV: ${treasuryBalance}`;
   
   clickCount++;
   if (clickCount >= 10) endGame();
});

// Add tip button handler
tipBtn.addEventListener('click', handleTip);

// Initial setup
loadEconomicData();
displayPersonalScores();
updateDisplays();