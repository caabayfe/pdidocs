(function(current) {
	var routeGR = new GlideRecordSecure("sys_ux_app_route");
	routeGR.addQuery("screen_type", current.getUniqueValue());
	routeGR.query();

	while(routeGR.next()) {
		if (routeGR.canRead()) {
			return true;
		}
	}
	
	return false;
})(current);
