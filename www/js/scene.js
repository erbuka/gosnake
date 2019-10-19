class Scene {
    /**
     * 
     * @param {Application} app 
     */
    constructor(app) {
        this.app = app;
        this.renderFunctions = [];
    }

    addRenderFunction(renderFn, index) {
        return new Promise((resolve) => {
            if (index === undefined) {
                index = this.renderFunctions.length;
            }
            this.renderFunctions.splice(index, 0, {
                fn: renderFn,
                resolveFn: resolve,
                data: {
                    invocationID: 0,
                    elapsedTime: 0
                }
            });
        });

    }

    onResize(evt) { }

    onTap(evt) { }

    onSwipe(evt) { }

    onKeyPress(evt) { }

    onRender(time) {
        for (let i = 0; i < this.renderFunctions.length; i++) {
            let func = this.renderFunctions[i];
            let result = func.fn(time, func.data);

            func.data.invocationID++;
            func.data.elapsedTime += time.delta;

            if (result) {
                this.renderFunctions.splice(i--, 1);
                func.resolveFn();
            }
        }
    }

}