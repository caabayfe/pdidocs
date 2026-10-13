function onLoad() {
	if(g_form.isNewRecord()) {
		g_form.setValue('model', 'ITSM');
		g_form.setValue('table', 'incident');
		setTimeout(function() {
			g_form.setValue('field', 'short_description');
			g_form.setValue('user_fields', 'state,contact_type,assignment_group,opened_at,closed_at,sys_updated_on');
		}, 500);
	}
}
