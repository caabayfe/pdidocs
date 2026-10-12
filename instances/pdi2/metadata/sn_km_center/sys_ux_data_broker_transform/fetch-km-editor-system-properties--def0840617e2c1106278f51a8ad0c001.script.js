function transform() {
	var names = [
		'glide.ui.html.editor.toolbar',
		'glide.ui.html.editor.valid_plugins',
		'glide.ui.html.editor.enabled_plugins',
		'glide.ui.html.editor.toolbar.valid_buttons'
	];

	var properties = {};
	for (var i = 0; i < names.length; i++) {
		properties[names[i]] = gs.getProperty(names[i], '');
	}

	return { properties: properties };
}
