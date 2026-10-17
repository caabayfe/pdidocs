(function() {
	var pipelineService;

	try {
		pipelineService = new PipelineService();
	}
	catch(ex) {
		gs.warn("AES User Sync failed to execute due to:  \n\n" + ex.toString() + "\n\n" + gs.getProperty("glide.servlet.uri") + current.getLink());
		return false;
	}

	return  (gs.getProperty('sn_app_eng_studio.user_sync_enabled') === 'true') && pipelineService.isProd();
})();
