// Game elements
let score = 0;
let gameActive = false;
let clickCount = 0;
const scoreDisplay = document.getElementById('score');
const clickButton = document.getElementById('clickButton');
const guestPlayButton = document.getElementById('guestPlayButton');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const personalScores = document.getElementById('personalScores');

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
    scoreDisplay.textContent = `Score: ${score}`;
    clickButton.disabled = false;
    clickButton.textContent = "Click Me!";
    return true;
}

function endGame() {
    gameActive = false;
    clickButton.disabled = true;
    clickButton.textContent = "Game Over - Come back tomorrow!";
    localStorage.setItem('lastPlayed', new Date().toDateString());
    saveScore(score);
}

// Handle guest play
guestPlayButton.addEventListener('click', () => {
    const guestId = generateGuestId();
    localStorage.setItem('playerId', guestId);
    guestPlayButton.textContent = 'Playing as Guest';
    guestPlayButton.disabled = true;
    startNewGame();
});

// Placeholder for login/register (Phase 3)
loginButton.addEventListener('click', () => {
    alert('Login functionality coming soon!');
});

registerButton.addEventListener('click', () => {
    alert('Registration functionality coming soon!');
});

// Score handling functions
function saveScore(finalScore) {
    let scores = JSON.parse(localStorage.getItem('myScores') || '[]');
    
    // Set first play date if it doesn't exist
    if (!localStorage.getItem('firstPlayDate')) {
        localStorage.setItem('firstPlayDate', new Date().toDateString());
    }
    
    scores.push({
        score: finalScore,
        date: new Date().toLocaleDateString(),
        daysPlayedRatio: calculateDaysPlayedRatio()
    });
    
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5); // Keep only top 5 scores
    localStorage.setItem('myScores', JSON.stringify(scores));
    displayPersonalScores();
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

// Main game click handler
clickButton.addEventListener('click', () => {
    if (!gameActive) return;
    
    const pointsEarned = getRandomPoints();
    score += pointsEarned;
    clickCount++;
    scoreDisplay.textContent = `Score: ${score} (Last click: +${pointsEarned}) - Clicks: ${clickCount}/10`;
    
    if (clickCount >= 10) {
        endGame();
    }
});

// Initial display
displayPersonalScores();