function requestFullscreen() {
    // Check if the browser supports the Fullscreen API 
    if (document.fullscreenEnabled) {
        // Get the element you want to make full screen 
        var elem = document.documentElement; // This will make the whole page full screen 

        // Request full screen 
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
    }
}
