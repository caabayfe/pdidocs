function onLoad() {
	if (!(g_user.hasRole('admin') || g_user.hasRole('dashboard_admin') || isOwner())) {
		g_form.setDisabled('owner',true);
	}
}

function isOwner() {
	var gr = new GlideRecord('pa_dashboards');
	gr.get(g_form.getUniqueValue());
	return gr.getValue("owner") == g_user.userID;
}
