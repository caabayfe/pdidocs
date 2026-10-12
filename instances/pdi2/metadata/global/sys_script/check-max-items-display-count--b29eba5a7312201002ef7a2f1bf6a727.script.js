(function executeRule(current, previous /*null when async*/) {

	if(current.max_items_display_count > 0)
		return;
	
	gs.addInfoMessage(gs.getMessage("Max items display count should be integer greater than 0"));
	var DEFAULT_MAX_ITEMS_DISPLAY = 1;
	current.max_items_display_count = DEFAULT_MAX_ITEMS_DISPLAY;

})(current, previous);
