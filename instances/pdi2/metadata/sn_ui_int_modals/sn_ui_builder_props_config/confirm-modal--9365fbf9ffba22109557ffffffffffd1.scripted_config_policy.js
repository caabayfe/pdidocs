function resizablePolicy({
	api,
	properties
}) {
	api.updateVisibility('resizableMinHeight', properties.enableResizable !== false);
	api.updateVisibility('resizableMinWidth', properties.enableResizable !== false);
	api.updateVisibility('resizableMaxHeight', properties.enableResizable !== false);
	api.updateVisibility('resizableMaxWidth', properties.enableResizable !== false);
}
