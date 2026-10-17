(function executeRule(current, previous /*null when async*/) {

	if (gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') !== 'true') { // Responsive Dashboards inactive
		current.should_migrate_permissions = true;
	}

})(current, previous);
