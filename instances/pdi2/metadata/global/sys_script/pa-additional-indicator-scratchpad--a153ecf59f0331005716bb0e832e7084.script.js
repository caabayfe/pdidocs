function onDisplay(current, g_scratchpad) {
	if (current.widget.type.getDisplayValue() === 'Workbench' && !current.widget_indicator){
		g_scratchpad.showRelatedAdditionalIndicators = true;
	} else {
		g_scratchpad.showRelatedAdditionalIndicators = false;
	}
	
	if (current.widget.type.getDisplayValue() === 'Workbench') {
		g_scratchpad.isProcessWidget = true;
	} else {
		g_scratchpad.isProcessWidget = false;
	}
}
