(function(current) {
	// only support this ACL for macroponents that extend the Dashboard Template
	var screenGR = new GlideRecordSecure("sys_ux_screen");
	screenGR.addQuery("macroponent", current.getUniqueValue());
	screenGR.addQuery("parent_macroponent", "3119f143532510102b54ddeeff7b126e");
	screenGR.setLimit(1);
	screenGR.query();
	if(screenGR.hasNext()) {
		return true;
	}

	return false;
})(current);
