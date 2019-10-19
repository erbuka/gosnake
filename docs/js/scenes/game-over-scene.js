"use strict";

class GameOverScene extends Scene {
    constructor(app, score) {
        super(app);
        this.score = score;
        this.app.saveScore(score);

        this.addRenderFunction(this.renderGameOver.bind(this));
        this.tapToExit = false;
    }

    renderGameOver(time, data) {
        const ENABLE_TAP_TO_EXIT = 2;

        let ctx = this.app.ctx;
        let viewport = this.app.viewport;

        if (!this.tapToExit && data.elapsedTime > ENABLE_TAP_TO_EXIT) {
            this.tapToExit = true;
        }

        ctx.save();
        {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.translate(viewport.width / 2, viewport.height / 2);

            this.app.setFontSize(3);

            ctx.fillStyle = Constants.Colors.Shadow;
            ctx.fillText("Game Over!", viewport.shadowSize, viewport.shadowSize);

            ctx.fillStyle = Constants.Colors.Primary;
            ctx.fillText("Game Over!", 0, 0);

            ctx.translate(0, 4);
            this.app.setFontSize(1);

            ctx.fillStyle = Constants.Colors.Primary;
            ctx.fillText("Score: " + this.score, 0, 0);

        }
        ctx.restore();

    }

    onTap(evt) {
        if (this.tapToExit) {
            this.app.gotoScene(new MainMenuScene(this.app));
        }
    }

}