function onLoad() {
	// users without the role global_tags_creator cannot share a tag with everyone but they can
	// inherit a tag shared with everyone and administer it
	if (g_form.getValue('viewable_by') != 'everyone' && !g_user.hasRole('global_tags_creator')) {
		g_form.removeOption('viewable_by', 'everyone');
		g_form.setDisplay('global', false);
	}
}
