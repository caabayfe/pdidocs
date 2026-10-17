answer = getAttachmentCreateAnswer();

function getAttachmentCreateAnswer() {
	
	var gr = new GlideRecord('interaction');
	if (!gr.get(current.table_sys_id) || !String(gr.application.scope).startsWith('sn_hr'))
		return false;
	return gr.canRead();
}
