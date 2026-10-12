var days = gs.getProperty('glide.webauthn.delete_credential_not_used_since_days', 90);
var now = new GlideDateTime();
var daysInMillisecond = days * 86400000;
now.subtract(daysInMillisecond);
deleteCredentialsWithValueLessOREqualToTime(now);

function deleteCredentialsWithValueLessOREqualToTime(time) {
	gs.info("Start: Deleting credentials with last used time less than equal to " + time.getDisplayValue());
	var gr = new GlideRecord('sys_user_public_credential');

	if(!gr.isValid()) {
		gs.debug('unable to get credentials for cleanup utility.');
		return;
	}
	
	gr.addQuery("last_used_time", "<=", time);
	gr.query();
	gr.deleteMultiple();
	gs.info("End: Deleting credentials with last used time less than equal to " + time.getDisplayValue());
}
