var fields = new UXBannerAnnouncementGetFields();

(function executeRule(current, previous /*null when async*/) {

	//check if announcement falls within the time window
	var currentTime = new GlideDateTime();
	var startDate = new GlideDateTime(current.start);
	var endDate = new GlideDateTime(current.end);
	var sessionTimeout = gs.getProperty('glide.ui.session_timeout');

	var announcementWindow = new GlideDateTime();
    announcementWindow.addSeconds(sessionTimeout * 60);
	announcementWindow = announcementWindow.getValue();

	if ((startDate < announcementWindow) && (endDate > currentTime ||
		!endDate)) {

		var records = {
			'old_record': fields.getFields(previous),
			'new_record': fields.getFields(current),
			'operation': 'announcement_delete',
			'current_announcement_sys_id': current.sys_id,
			'previous_announcement_sys_id': previous.sys_id
		};
		gs.publish('/uxbannerannouncements', records);
	}
	return;

})(current, previous);
