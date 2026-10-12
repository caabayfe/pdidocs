(function executeRule(current, previous /*null when async*/) {
	if (current.value == 'true') {
		GlideCacheManager.flush('application_rest_menu_list');
	} else if (current.value == 'false') {
		GlideCacheManager.flush('application_rest_menu_ids');
	}
})(current, previous);
