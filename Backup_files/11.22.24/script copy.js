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

function createFireworks() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            document.body.appendChild(firework);
            
            // Remove the firework element after animation
            setTimeout(() => {
                firework.remove();
            }, 1000);
        }, i * 200); // Stagger the fireworks
    }
}

function endGame() {
    gameActive = false;
    clickButton.disabled = true;
    clickButton.textContent = "Game Over - Come back tomorrow!";
    localStorage.setItem('lastPlayed', new Date().toDateString());
    saveScore(score);
    createFireworks();
}

// Handle guest play
guestPlayButton.addEventListener('click', () => {
    const guestId = generateGuestId();
    localStorage.setItem('playerId', guestId);
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
        startNewGame();
    } else {
        alert('Registration failed. Please try again.');
    }
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



// Add these new functions here
async function register(username, password) {
    try {
        const response = await fetch('http://localhost:3000/auth/register', {
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
        const response = await fetch('http://localhost:3000/auth/login', {
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