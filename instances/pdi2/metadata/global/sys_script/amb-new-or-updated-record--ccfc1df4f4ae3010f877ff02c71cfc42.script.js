var fields = new UXBannerAnnouncementGetFields();

var getMappedConfigs = function (previousStartDate, startDate, announcementWindow, previousEndDate, currentTime, current, message) {
	/*
	 * If the previous dates were invalid, the component doesn't have the sys_id of the now valid announcement.
	 * So we need to send the configs that are active and mapped to this new announcement.
	 * If the component is mapped to this config, it knows it needs to create the now valid announcement.
	*/

	if ((previousStartDate > currentTime && startDate <= currentTime) || (previousEndDate && previousEndDate < currentTime)) {
			var configIds = [];
			var m2m_gr = new GlideRecord('sys_ux_m2m_banner_announcement');
			m2m_gr.addQuery('announcement', current.sys_id);
			m2m_gr.query();
			while(m2m_gr.next()) {
				if (m2m_gr.announcement_config.active == true) {
					configIds.push(m2m_gr.getValue('announcement_config'));
				}
			}
			message['mappedConfigIds'] = configIds;
	}
};

var rescheduleAnnouncement = function (currentTime, startDate, endDate, announcementWindow, message) {
	/*
	 * If the new announcement dates are valid, check whether the announcements currently on the component need to
	 * expire or arrive at a different time.
	*/
	if (currentTime < startDate && startDate < announcementWindow) {
		//Expire the announcement on the component and reschedule to arrive soon
		message['annComingSoon'] = true;
	}

	if (currentTime < endDate && endDate < announcementWindow) {
		//Show the announcement on the component and reschedule to expire soon
		message['annExpiringSoon'] = true;
	}
};

var shouldRemoveAnnouncement = function (previousStartDate, announcementWindow, previousEndDate, currentTime, current, previous) {
	/*
	 * If the announcement's new dates are invalid, and the previous dates were valid,
	 * we need to send a message to delete the announcement from the component.
	*/
	if ((previousStartDate < announcementWindow) && (previousEndDate > currentTime ||
		!previousEndDate))  {
		var removeAnnouncementMessage = {
			'operation': 'announcement_change',
			'current_announcement_sys_id': current.sys_id,
			'incorrect_dates': true,
			'old_record': fields.getFields(previous),
			'new_record': fields.getFields(current)
		};
		return removeAnnouncementMessage;
	}
};

(function executeRule(current, previous /*null when async*/) {

	//check if announcement falls within the time window
	var currentTime = new GlideDateTime();
	var startDate = new GlideDateTime(current.start);
	var previousStartDate = new GlideDateTime(previous.start);
	var previousEndDate = new GlideDateTime(previous.end);
	var endDate = new GlideDateTime(current.end);
	var sessionTimeout = gs.getProperty('glide.ui.session_timeout');

    var announcementWindow = new GlideDateTime();
    announcementWindow.addSeconds(sessionTimeout * 60);
	announcementWindow = announcementWindow.getValue();

	/*
	 * If announcement's new dates are valid:
	 * Find the configurations that the updated announcement was mapped to.
	 * Check if we need to reschedule the announcement on the component to arrive soon or expire soon
	*/
	if ((startDate < announcementWindow) && (endDate > currentTime ||
		!endDate)) {

		var message = {
			'old_record': fields.getFields(previous),
			'new_record': fields.getFields(current),
			'operation': 'announcement_change',
			'current_announcement_sys_id': current.sys_id,
			'previous_announcement_sys_id': previous.sys_id

		};

		//Attach the configs mapped to this announcement to the message, if needed
		getMappedConfigs(previousStartDate, startDate, announcementWindow, previousEndDate, currentTime, current, message);

		//Attach a flag whether to expire or show the announcements currently on the component, if needed
		rescheduleAnnouncement(currentTime, startDate, endDate, announcementWindow, message);
		gs.publish('/uxbannerannouncements', message);
	} else {
		//Check if the previous dates were valid, if so, we need to remove the announcement from the component
		var removeAnnouncementMessage = shouldRemoveAnnouncement(previousStartDate, announcementWindow, previousEndDate, currentTime, current, previous, message);
		if (removeAnnouncementMessage)
			gs.publish('/uxbannerannouncements', removeAnnouncementMessage);
	}

	return;

})(current, previous);
