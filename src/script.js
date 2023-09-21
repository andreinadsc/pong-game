const canvas = document.querySelector('canvas');
const canvasContext = canvas.getContext("2d");

canvas.width = 2000;
canvas.height = 1600;

const COLORS = [
    {
        text: '#00BCFF',
        details: '#804CF6'
    },
    {
        text: '#FFB704',
        details: '#8ECAE6'
    },
    {
        text: '#F1DDDF',
        details: '#C7B989'
    },
    {
        text: '#FCF5DF',
        details: '#BBEEF2'
    },
    {
        text: '#F2C4CE',
        details: '#F58F7C'
    }
];

const DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

const PLAYER = {
    x: 110,
    y: (canvas.height / 2) - 50,
    speed: 10,
    score: 0,
    move: DIRECTION.IDLE
};

const COMPUTER = {
    x: canvas.width - 125,
    y: (canvas.height / 2) - 50,
    speed: 10,
    score: 0,
    move: DIRECTION.IDLE
};

const BALL = {
    height: 20,
    width: 20,
    x: canvas.width / 2,
    y: canvas.height / 2 + 25,
    moveX: DIRECTION.IDLE,
    moveY: DIRECTION.IDLE,
    speed: 11
}

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;

let isRunning;
let isOver;
let turn;
let timer;
let round;
let theme = 0;


const drawPaddleAndScore = (isPlayer = false) => {
    canvasContext.fillRect(
        isPlayer ? PLAYER.x : COMPUTER.x,
        isPlayer ? PLAYER.y : COMPUTER.y,
        PADDLE_WIDTH,
        PADDLE_HEIGHT
    );

    canvasContext.fillText(
        isPlayer ? PLAYER.score : COMPUTER.score,
        (canvas.width / 2) + (isPlayer ? (-300) : 300),
        300
    );
};

const drawBall = () => {
    canvasContext.beginPath();
    canvasContext.arc(
        BALL.x,
        BALL.y,
        20,
        0,
        2 * Math.PI,
        false);
    canvasContext.fill();
};

const drawCenterText = (text) => {
    canvasContext.fillStyle = 'rgba(0,0,0,.2)';
    canvasContext.fillRect(
        canvas.width / 2 - 570,
        canvas.height / 2 - 60,
        1100,
        200
    );

    canvasContext.fillStyle = COLORS[theme].text;
    canvasContext.font = '8rem Courier New';
    canvasContext.fillText(text,
        canvas.width / 2 - 25,
        canvas.height / 2 + 55
    );
};

const listeners = () => {
    document.addEventListener('keydown', event => {
        if (isRunning === false) {
            isRunning = true;
            drawCourt();
            window.requestAnimationFrame(startGame);
        }

        if (event.key === 'ArrowUp' || event.key === 'w') PLAYER.move = DIRECTION.UP;

        if (event.key === 'ArrowDown' || event.key === 's') PLAYER.move = DIRECTION.DOWN;
    });

    //stop the player moves
    document.addEventListener('keyup', (event) => PLAYER.move = DIRECTION.IDLE);
};

const selectCourtTheme = () => {
    theme = theme === 4 ? 0 : theme + 1;
    document.documentElement.setAttribute('data-theme', theme);
};

const waitNewServe = () => ((new Date()).getTime() - timer) >= 100;

const drawCourt = () => {
    canvasContext.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvasContext.lineWidth = 10;
    canvasContext.strokeStyle = COLORS[theme].details;
    canvasContext.beginPath();

    canvasContext.setLineDash([]);
    canvasContext.strokeRect(canvas.width - 1900, canvas.height - 1500, 1800, 1400)
    canvasContext.fill();

    canvasContext.setLineDash([10, 20]);
    canvasContext.moveTo((canvas.width / 2), canvas.height - 120);
    canvasContext.lineTo((canvas.width / 2), 100);
    canvasContext.stroke();

    canvasContext.fillStyle = COLORS[theme].text;

    canvasContext.font = '150px Courier New';
    canvasContext.textAlign = 'center';

    if (!isRunning) drawCenterText('Press any key to begin');
    else if (isRunning && waitNewServe()) drawBall();

    // Player paddle and score
    drawPaddleAndScore(true);
    // Computer paddle and score
    drawPaddleAndScore();


    // round number
    canvasContext.font = '50px Courier New';
    canvasContext.fillText(
        'Round ' + (round + 1),
        (canvas.width / 2),
        75
    );
};

const resetTurn = (winner) => {
    timer = (new Date()).getTime();
    BALL.x = canvas.width / 2 - 25;
    BALL.y = canvas.height / 2 + 25;

    if (winner === 'player') {
        turn = 'computer';
        PLAYER.score += 1;
    }
    else {
        turn = 'player';
        COMPUTER.score += 1;
    }

    drawBall();
    beep2.play();
};

const paddleBallCollision = (isPlayer = false) => {
    const currentPlayer = isPlayer ? PLAYER : COMPUTER;

    if (BALL.x - BALL.width <= currentPlayer.x && BALL.x >= currentPlayer.x - PADDLE_WIDTH) {
        if (BALL.y <= currentPlayer.y + PADDLE_HEIGHT && BALL.y + BALL.height >= currentPlayer.y) {
            BALL.x = (COMPUTER.x - BALL.width);
            BALL.x = (currentPlayer.x + (isPlayer ? BALL.width : - BALL.width));
            BALL.moveX = isPlayer ? DIRECTION.RIGHT : DIRECTION.LEFT;
            beep1.play();
        }
    }
};

const paddleBoardCollision = (currentPlayer) => {
    if (currentPlayer.y <= 120) currentPlayer.y = 120;
    else if (currentPlayer.y >= ((canvas.height - 120) - PADDLE_HEIGHT)) currentPlayer.y = ((canvas.height - 120) - PADDLE_HEIGHT);
};

const setScores = (text) => {
    isOver = true;
    setTimeout(() => endGame(text), 1000);
};


const movements = () => {
    if (!isOver) {
        //check and adjust ball boundaries
        if (BALL.x <= 115) resetTurn('computer');
        if (BALL.x >= (canvas.width - 115) - BALL.width) resetTurn('player');
        if (BALL.y <= 115) BALL.moveY = DIRECTION.DOWN;
        if (BALL.y >= (canvas.height - 115) - BALL.height) BALL.moveY = DIRECTION.UP;


        //player paddle collision with court boundaries
        paddleBoardCollision(PLAYER);
        //computer paddle collision with court boundaries
        paddleBoardCollision(COMPUTER);

        //move the ball for a new serve 
        if (waitNewServe() && turn) {
            BALL.moveX = turn === 'player' ? DIRECTION.LEFT : DIRECTION.RIGHT;
            BALL.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
            turn = null;
        }

        // Move ball in intended direction based on moveY and moveX values
        if (BALL.moveY === DIRECTION.UP) BALL.y -= (BALL.speed / 1.5);
        else if (BALL.moveY === DIRECTION.DOWN) BALL.y += (BALL.speed / 1.5);
        if (BALL.moveX === DIRECTION.LEFT) BALL.x -= BALL.speed;
        else if (BALL.moveX === DIRECTION.RIGHT) BALL.x += BALL.speed;


        //update players move according to keyboard
        if (PLAYER.move === DIRECTION.UP) PLAYER.y -= PLAYER.speed;
        else if (PLAYER.move === DIRECTION.DOWN) PLAYER.y += PLAYER.speed;


        //computer movements 
        if (COMPUTER.y > BALL.y - (PADDLE_HEIGHT / 2)) {
            if (BALL.moveX === DIRECTION.RIGHT) COMPUTER.y -= COMPUTER.speed / 1.8;
            else COMPUTER.y -= COMPUTER.speed / 4;
        }

        if (COMPUTER.y < BALL.y - (PADDLE_HEIGHT / 2)) {
            if (BALL.moveX === DIRECTION.RIGHT) COMPUTER.y += COMPUTER.speed / 1.8;
            else COMPUTER.y += COMPUTER.speed / 4;
        }

        // Player hits ball
        paddleBallCollision(true);
        // computer hits ball
        paddleBallCollision(false);

        //checking scores
        if (PLAYER.score === 5 && round === 4) setScores('Winner!');
        else if (PLAYER.score === 5 && round < 4) {
            selectCourtTheme();
    
            PLAYER.score = COMPUTER.score = 0;
            PLAYER.speed += 0.5;
            COMPUTER.speed += 0.5;
            BALL.speed += 1;
            round += 1;

            beep3.play();
        }
        else if (COMPUTER.score === 5) setScores('Game Over');
    }
}


const startGame = () => {
    movements();
    drawCourt();
    if (!isOver) requestAnimationFrame(startGame);
};

const endGame = (text) => {
    drawCenterText(text)
    setTimeout(() => init(), 3000);
};

const init = () => {
    PLAYER.score = COMPUTER.score = 0;
    isRunning = isOver = false;
    timer = round = 0;
    turn = 'player';

    drawCourt();
    listeners();
};

init();