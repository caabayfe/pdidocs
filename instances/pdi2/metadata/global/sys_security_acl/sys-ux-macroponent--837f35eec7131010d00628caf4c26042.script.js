(function(current) {
	var screenGR = new GlideRecordSecure("sys_ux_screen");
	screenGR.addQuery("macroponent", current.getUniqueValue());
	screenGR.query();

	while(screenGR.next()) {
		if (screenGR.canDelete()) {
			return true;
		}
	}
	
	return false;
})(current);
