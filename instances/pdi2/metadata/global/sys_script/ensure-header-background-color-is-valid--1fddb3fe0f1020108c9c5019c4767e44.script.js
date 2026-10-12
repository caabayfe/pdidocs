(function executeRule(current, previous /*null when async*/) {

	function isColorValid(color) {
		
		// No color provided is a valid state, otherwise verify it conforms to #RGB or #RRGGBB.
		
		if (gs.nil(color))
			return true;
		
		var pattern = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
		return color.match(pattern);
	
	}
	
	var color = current.header_background_color;

	if (!isColorValid(color)) {
		gs.addErrorMessage(gs.getMessage('Header Background Color must be a valid hexadecimal format: (#RGB or #RRGGBB)'));
		current.setAbortAction(true);
	} 	

})(current, previous);
