// Rerun the currently selected layout algorithm using the given node as if it were the root
runLayout();

function runLayout() {
	// Re-run layout algorithms for nodes and links
    bsmNodeLayout.runCurrentLayout(bsmGraph.current(), item);
    bsmLinkLayout.recalculateAllLinks(bsmGraph.current());
	
	// Draw to update the graph itself over 1.25 seconds
    bsmRenderer.drawAll(1250);
	
	// Fit the graph to screen and move the camera to fit the view over 1.00 seconds
    bsmCamera.fitToScreen(bsmGraph.current());
    bsmCamera.moveCamera(1000);
}
