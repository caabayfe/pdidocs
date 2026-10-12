updateAnalyticsSource();
function updateAnalyticsSource() {

	var gr = new GlideRecord('pa_dm_analytics_source');
	gr.query();
	while (gr.next()) {
	    var grState = new GlideRecord('pa_dm_source_state');
		grState.addQuery('analytics_source', gr.getValue('id'));
		grState.query();
		if (grState.next()) {
		  gr.setValue('is_data_collection_enabled', true);
		} else {
		  gr.setValue('is_data_collection_enabled', false);
		}
		gr.setWorkFlow(false);
		gr.update();
	}
}
