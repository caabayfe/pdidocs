function onLoad() {
   
   if (g_scratchpad.provider == 'NowMQ Provider') {
		g_form.setLabelOf('requested_jobs', 'Requested Jobs Per Node');
		g_form.setLabelOf('actual_jobs', 'Actual Jobs Per Node');
   }
   
}
