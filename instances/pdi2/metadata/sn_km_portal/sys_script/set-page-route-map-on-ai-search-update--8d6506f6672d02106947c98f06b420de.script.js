(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecordSecure('sp_page_route_map');
	if (gr.get('6367d874732010107a942e46fbf6a7ef')) {
		gr.setValue('active', !current.enable_ais);
		gr.update();
	}
})(current, previous);
