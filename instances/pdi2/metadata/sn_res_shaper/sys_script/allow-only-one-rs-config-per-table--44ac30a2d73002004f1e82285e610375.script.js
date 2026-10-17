function onBefore(current, previous) {
	var gr = new GlideRecord("sys_resolutionshaper_config");
	gr.addQuery("table", current.table);
	gr.query();
	if (gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('You may only have a single active Resolution Shaper Configuration for Table {0}',current.getDisplayValue('table')));
		current.setAbortAction(true);
	}   
}
