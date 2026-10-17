// Fit the graph to the viewport in its current configuration
fitToScreen();

function fitToScreen() {
	// Fit the graph to screen and move the camera to fit the view over 1.00 seconds
    bsmCamera.fitToScreen(bsmGraph.current());
    bsmCamera.moveCamera(1000);
}
