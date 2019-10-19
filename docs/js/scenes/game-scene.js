"use strict";

const GameStates = {
    Playing: 0,
    Paused: 1,
    GameOver: 2
}

const GridValues = {
    Empty: 0,
    Wall: 1,
    Snake: 2,
    Fruit: 3
}

const Directions = {
    Left: new Vec2(-1, 0),
    Right: new Vec2(1, 0),
    Up: new Vec2(0, -1),
    Down: new Vec2(0, 1)
}

class GameScene extends Scene {

    constructor(app) {
        super(app);

        this.snakeInitialLength = 3;
        this.gridOffset = 0;
        this.gridHeight = app.viewport.height - this.gridOffset * 2;
        this.gridWidth = app.viewport.width - this.gridOffset * 2;
        this.score = 0;

        this.initializeGame();
        this.addRenderFunction(this.renderGame.bind(this));

        setTimeout(() => {
            this.gameMessage("3");
            this.app.playSound(Constants.Sfx.Countdown);
        }, 500);
        setTimeout(() => {
            this.gameMessage("2");
            this.app.playSound(Constants.Sfx.Countdown);
        }, 1500);
        setTimeout(() => {
            this.gameMessage("1");
            this.app.playSound(Constants.Sfx.Countdown);
        }, 2500);
        setTimeout(() => {
            this.gameMessage("Go!");
            this.gameState = GameStates.Playing;
            this.app.playSound(Constants.Sfx.Go);
        }, 3500);


    }

    gameMessage(text, duration) {
        duration = duration || 0.5;
        return this.addRenderFunction((time, data) => {
            let delta = Math.min(duration, data.elapsedTime) / duration;
            let ctx = this.app.ctx;
            ctx.save();
            {
                this.app.setFontSize(5);
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.translate(this.app.viewport.width / 2, this.app.viewport.height / 2);
                ctx.scale(2 - delta, 2 - delta);

                ctx.globalAlpha = delta;

                ctx.fillStyle = Constants.Colors.Shadow;
                ctx.fillText(text, 0.1, 0.1);

                ctx.fillStyle = Constants.Colors.Highlight;
                ctx.fillText(text, 0, 0);


            }
            ctx.restore();

            if (delta === 1) {
                return true;
            }

        });
    }

    initializeGame() {

        let center = new Vec2(this.gridWidth / 2, this.gridHeight / 2).floor();

        this.gameState = GameStates.Paused;

        this.direction = new Vec2().copy(Directions.Right);
        this.speed = 7;
        this.speedTimer = 0;
        this.nextDirection = null;

        this.grid = new Array(this.gridWidth * this.gridHeight).fill(GridValues.Empty);
        for (let y = 0; y < this.gridHeight; y++) {
            this.setGrid(0, y, GridValues.Wall);
            this.setGrid(this.gridWidth - 1, y, GridValues.Wall);
        }
        for (let x = 0; x < this.gridWidth; x++) {
            this.setGrid(x, 0, GridValues.Wall);
            this.setGrid(x, this.gridHeight - 1, GridValues.Wall)
        }

        this.snake = [];
        for (let i = 0; i < this.snakeInitialLength; i++) {
            this.snake.push(new Vec2().copy(center).add(Directions.Left.clone().mulScalar(i)));
        }


        for (let s of this.snake)
            this.setGrid(s.x, s.y, GridValues.Snake);

        this.generateFruit();

    }

    generateFruit() {
        let freeCells = this.grid.map((v, i) => v === GridValues.Empty ? i : -1).filter(v => v !== -1);
        let idx = freeCells[Math.floor(Math.random() * freeCells.length)];
        this.grid[idx] = GridValues.Fruit;
    }

    setGrid(x, y, v) {
        this.grid[y * this.gridWidth + x] = v;
    }

    getGrid(x, y) {
        return this.grid[y * this.gridWidth + x];
    }

    onKeyPress(evt) {
        switch (evt.code) {
            case "KeyA": this.go(Directions.Left); break;
            case "KeyD": this.go(Directions.Right); break;
            case "KeyW": this.go(Directions.Up); break;
            case "KeyS": this.go(Directions.Down); break;
        }
    }

    onSwipe(evt) {
        switch (evt.type) {
            case "swipeleft": this.go(Directions.Left); break;
            case "swiperight": this.go(Directions.Right); break;
            case "swipeup": this.go(Directions.Up); break;
            case "swipedown": this.go(Directions.Down); break;
        }
    }

    go(dir) {
        let horizontal = this.direction.equals(Directions.Left) || this.direction.equals(Directions.Right);
        let nextHorizontal = dir.equals(Directions.Left) || dir.equals(Directions.Right);

        if (horizontal ^ nextHorizontal) {
            this.nextDirection = new Vec2().copy(dir);
        }
    }

    update(time) {

        const GAME_OVER_TIME = 1;

        if (this.gameState === GameStates.Playing) {
            this.speedTimer += time.delta * this.speed;

            while (this.speedTimer > 1) {

                this.speedTimer -= 1;

                if (this.nextDirection) {
                    this.direction.copy(this.nextDirection);
                    this.nextDirection = null;
                }

                let head = this.snake[0];
                let tail = this.snake[this.snake.length - 1];

                let newHead = head.clone().add(this.direction);

                switch (this.getGrid(newHead.x, newHead.y)) {
                    case GridValues.Fruit:
                        // Eat fruit
                        this.score += 10;
                        this.setGrid(newHead.x, newHead.y, GridValues.Snake);
                        this.snake.splice(0, 0, newHead);
                        this.app.playSound(Constants.Sfx.EatFruit);
                        this.generateFruit();
                        break;
                    case GridValues.Wall:
                    case GridValues.Snake:
                        this.gameState = GameStates.GameOver;
                        this.app.playSound(Constants.Sfx.GameOver);
                        setTimeout(() => this.app.gotoScene(new GameOverScene(this.app, this.score)), GAME_OVER_TIME * 1000);
                        break;
                    case GridValues.Empty:

                        this.setGrid(newHead.x, newHead.y, GridValues.Snake);
                        this.setGrid(tail.x, tail.y, GridValues.Empty);

                        for (let i = this.snake.length - 1; i > 0; i--)
                            this.snake[i].copy(this.snake[i - 1]);
                        this.snake[0].copy(newHead);

                        break;
                }

            }

        }
    }

    renderGame(time) {

        const SNAKE_STR = "GLOBAL OUTSOURCING GROUP 5";

        this.update(time);

        let ctx = this.app.ctx;
        let viewport = this.app.viewport;

        ctx.save();
        {

            let drawWall = (x, y) => {
                // Shadow
                ctx.fillStyle = Constants.Colors.Shadow;
                ctx.fillRect(x + viewport.shadowSize, y + viewport.shadowSize, 1, 1);


                // Wall
                ctx.fillStyle = Constants.Colors.Secondary;
                ctx.fillRect(x, y, 1, 1);
            }


            ctx.translate(this.gridOffset, this.gridOffset);

            this.app.setFontSize(1);
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";


            // Background grid
            ctx.strokeStyle = Constants.Colors.LightGray;
            ctx.lineWidth = 1 / this.app.viewport.scaleFactor;
            for (let x = 0; x < this.gridWidth; x++) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.gridHeight);
                ctx.stroke();
            }
            for (let y = 0; y < this.gridHeight; y++) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.gridWidth, y);
                ctx.stroke();
            }


            let fruitText = "A";

            // Snake shadow
            ctx.fillStyle = Constants.Colors.Shadow
            for (let v of this.snake) {
                ctx.fillRect(v.x + 0.1, v.y + 0.1, 1, 1);
            }


            // Draw walls and fruit
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    switch (this.getGrid(x, y)) {
                        case GridValues.Fruit:

                            ctx.fillStyle = Constants.Colors.Shadow;
                            ctx.fillRect(x + viewport.shadowSize, y + viewport.shadowSize, 1, 1);

                            ctx.fillStyle = Constants.Colors.Highlight;
                            ctx.fillRect(x, y, 1, 1);

                            ctx.fillStyle = Constants.Colors.Light;
                            ctx.fillText(fruitText, x + 0.5, y + 0.5);
                            break;
                        case GridValues.Wall:
                            drawWall(x, y);
                            break;
                    }
                }
            }

            // Draw snake
            ctx.fillStyle = this.gameState === GameStates.GameOver ?
                (Math.cos(50 * time.elapsed) >= 0 ? Constants.Colors.Primary : Constants.Colors.Highlight) :
                Constants.Colors.Primary;


            for (let v of this.snake) {
                ctx.fillRect(v.x, v.y, 1, 1);
            }

            ctx.fillStyle = Constants.Colors.Light;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            for (let i = this.snakeInitialLength; i < this.snake.length && i < SNAKE_STR.length + this.snakeInitialLength; i++) {
                let i0 = i - this.snakeInitialLength;
                ctx.fillText(SNAKE_STR.charAt(i0), this.snake[i].x + 0.5, this.snake[i].y + 0.5);
            }

            // Draw score
            this.app.setFontSize(1);
            ctx.fillStyle = Constants.Colors.Primary;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Score: " + this.score, 1, 0);
        }
        ctx.restore();

    }
}
