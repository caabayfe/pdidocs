function onLoad() {
	if (g_form.getValue('source') === 'sys_user_group') {
		displayGroups();
		hideUserConditions();
		// Clear the user conditions, because its not valid if source is sys_user_group
		clearUserConditions();
	} else if (g_form.getValue('source') === 'sys_user') {
		showUserConditions();
		hideGroups();
		// Clear the groups field, because its not valid if source is sys_user
		clearGroups();
		
		// If the source is sys_user, set a default active = true filter
		// admin has the option to remove this
		if (g_form.isNewRecord()) {
			g_form.setValue('conditions', 'active=true');
		}
	}
}

function displayGroups() {
	g_form.setDisplay('groups', true);
}

function hideGroups() {
	g_form.setDisplay('groups', false);
}

function showUserConditions() {
	g_form.setDisplay('conditions', true);
}

function hideUserConditions() {
	g_form.setDisplay('conditions', false);
}

function clearUserConditions() {
	g_form.setValue('conditions', '');
}

function clearGroups() {
	g_form.setValue('groups', '');
}
