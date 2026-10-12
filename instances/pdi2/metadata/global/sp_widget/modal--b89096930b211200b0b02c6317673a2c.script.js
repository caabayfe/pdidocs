// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
(function(){
	var id = options.embeddedWidgetId || input.embeddedWidgetId;
	var opt = options.embeddedWidgetOptions || input.embeddedWidgetOptions;
	// if the modal initialization paramets not available in options, fetch from input.
	if (!options.backdrop && input.backdrop)
		options.backdrop = input.backdrop;
	if (!options.keyboard && input.keyboard != undefined)
		options.keyboard = input.keyboard;
	if (!options.size && input.size)
		options.size = input.size;
	if (!options.modalLabel && input.modalLabel)
		options.modalLabel = input.modalLabel;

	data.instance = $sp.getWidget(id, opt);
})();
