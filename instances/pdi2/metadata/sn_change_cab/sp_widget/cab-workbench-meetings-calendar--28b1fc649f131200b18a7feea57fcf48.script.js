(function() {
	data.timeFormat = new global.CalendarUtils().getUserTimeFormat().replace(/\W*%s/, "");
	data.useSOWMeeting = gs.getProperty('sn_change_cab.com.snc.change_management.cab.use_sow_meeting', false);
	data.hasSOWRole = gs.hasRole('sn_sow.sow_user');
})();
