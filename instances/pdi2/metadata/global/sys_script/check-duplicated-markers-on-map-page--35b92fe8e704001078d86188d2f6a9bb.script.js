(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Duplicated marker {0} is added on the map page {1}.", [current.map_marker.getDisplayValue(), current.map_page.getDisplayValue()]));
})(current, previous);
