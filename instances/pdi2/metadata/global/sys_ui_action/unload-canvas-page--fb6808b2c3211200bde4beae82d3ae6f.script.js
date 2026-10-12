// Add current canvas page record
SNC.ContentUnloader.unloadMetadata(current);

// Add all grid canvas panes related to the current canvas page record
var grGridCanvasPane = new GlideRecord("sys_grid_canvas_pane");
grGridCanvasPane.addQuery("grid_canvas", current.sys_id);
grGridCanvasPane.query();
while (grGridCanvasPane.next()) {
	SNC.ContentUnloader.unloadMetadata(grGridCanvasPane);
}
