function transform() {
	return {
		isGlobalAppCreationEnabled: gs.getProperty('sn_g_app_creator.allow_global') === 'true'
	};
}
