(function executeRule(current, previous /*null when async*/) {
	//check if announcement falls within the time window
	var currentTime = new GlideDateTime();
	var startDate = new GlideDateTime(current.announcement.start);
	var endDate = new GlideDateTime(current.announcement.end);
	var sessionTimeout = gs.getProperty('glide.ui.session_timeout');
	
	var announcementWindow = new GlideDateTime();
    announcementWindow.addSeconds(sessionTimeout * 60);
	announcementWindow = announcementWindow.getValue();

	if ((startDate < announcementWindow) && (endDate > currentTime ||
		!endDate)) {

		if (current.announcement_config.active == true) {
			var records = {
				'current_announcement_sys_id': current.announcement,
				'previous_announcement_sys_id': previous.announcement,
				'current_announcement_config_id': current.announcement_config,
				'previous_announcement_config_id': previous.announcement_config,
				'operation': 'm2m_delete'
			};
			gs.publish('/uxbannerannouncements', records);
		}
	}
	return;
})(current, previous);
