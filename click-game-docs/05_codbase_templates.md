# Code Base Templates

## Basic Game Structure
### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Click Game</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="game-container">
        <h1>Click Game</h1>
        <div id="score">Score: 0</div>
        <button id="clickButton">Click Me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>


.game-container {
    text-align: center;
    padding: 20px;
    font-family: Arial, sans-serif;
}

#clickButton {
    padding: 20px 40px;
    font-size: 18px;
    margin: 20px;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
}

#score {
    font-size: 24px;
    margin: 20px;
}


let score = 0;
const scoreDisplay = document.getElementById('score');
const clickButton = document.getElementById('clickButton');

clickButton.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
});