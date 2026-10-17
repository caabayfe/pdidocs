(function executeRule(current, previous /*null when async*/) {

	function isColorValid(color) {
		
		// No color provided is a valid state, otherwise verify it conforms to #RGB or #RRGGBB.
		
		if (gs.nil(color))
			return true;
		
		var pattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
		return color.match(pattern);
	
	}
	
	if (!isColorValid(current.getValue('brand_color')) || !isColorValid(current.getValue('primary_color'))) {
		gs.addErrorMessage(gs.getMessage('Color must be a valid hexadecimal format: (#RGB or #RRGGBB)'));
		current.setAbortAction(true);
	}

})(current, previous);
