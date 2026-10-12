(function(current) {
	var routeGR = new GlideRecordSecure("sys_ux_app_route");
	routeGR.addQuery("screen_type", current.getUniqueValue());
	routeGR.query();

	while(routeGR.next()) {
		if (routeGR.canWrite()) {
			return true;
		}
	}

	return false;
})(current);
