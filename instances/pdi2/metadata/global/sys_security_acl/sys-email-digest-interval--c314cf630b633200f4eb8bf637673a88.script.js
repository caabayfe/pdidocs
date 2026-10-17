answer = getEmailDigestIntervalAnswer();

function getEmailDigestIntervalAnswer() {
	if (!gs.hasRole('admin') && !gs.hasRole('notification_admin'))
		return false;
	
	var gr = new GlideRecord('sys_email_digest_user_pref');
	gr.addQuery('interval', current.sys_id);
	gr.addActiveQuery();
	gr.query();
	
	return !gr.hasNext();
}
