answer = getEmailDigestPartAnswer();

function getEmailDigestPartAnswer() {
	if(gs.hasRole("email_digest_admin"))
		return true;
	var gr = new GlideRecord('sys_email_digest_part_user');
	gr.addQuery('digest_part', current.sys_id);
	gr.addQuery('user', gs.getUserID());
	gr.query();

	return gr.hasNext();	
}
