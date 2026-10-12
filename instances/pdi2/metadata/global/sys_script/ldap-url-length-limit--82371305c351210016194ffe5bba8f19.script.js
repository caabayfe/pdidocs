verifyURLLength();
function verifyURLLength() {
	var url_exclude_current = new LDAPURLUtils().getAccumURLExclude(current.server, current.sys_id);
	var full_url_length = url_exclude_current.length + 1 + current.url.toString().length;
	if(full_url_length > 1000) {
		gs.addErrorMessage('Accumulated URL length is limited to 1000. You have exceeded by ' + (full_url_length-1000));
		current.setAbortAction(true);
	}
}
