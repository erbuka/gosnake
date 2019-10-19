(function()  {
    document.addEventListener("deviceready", function() {
        screen.orientation.lock("landscape");
        new Application().start();
    });
})();
