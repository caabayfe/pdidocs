function processUserInput() {
	var itemTableName = gel('item_type_selector').value;
	var gdw = GlideDialogWindow.get();
	var processFunction = gdw.getPreference('onPromptComplete');
	if (typeof (processFunction) === 'function')
		try {
			processFunction.call(gdw, itemTableName);
		} catch (e) {
		}

	gdw.destroy();
	return false;
}
