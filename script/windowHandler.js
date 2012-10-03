function resizeWindow() {
    var screenWidth = window.innerWidth - 10;
    var screenHeight = window.innerHeight - 10;
    if(screenWidth/screenHeight < WIDTH/HEIGHT)
        screenHeight = (HEIGHT / WIDTH) * screenWidth;
    else
        screenWidth = (WIDTH / HEIGHT) * screenHeight;
    var canvas = document.getElementById("canvas");
    canvas.style.width = screenWidth + "px";
    canvas.style.height = screenHeight + "px";
    canvas.style.marginLeft = ((window.innerWidth - screenWidth) / 2) + "px";
    canvas.style.marginTop = ((window.innerHeight - screenHeight) / 2) + "px";
}
window.addEventListener("resize", resizeWindow, false);
setTimeout(resizeWindow, 0);