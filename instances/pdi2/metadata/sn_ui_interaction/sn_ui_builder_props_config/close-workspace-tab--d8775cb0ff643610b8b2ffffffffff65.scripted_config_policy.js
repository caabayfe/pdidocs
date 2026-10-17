function resizablePolicy({
	api,
	properties
}) {
	api.updateVisibility('messages', properties.forceClose !== true);
}
