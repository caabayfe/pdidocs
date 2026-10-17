function onCondition() {
    if (g_form.isNewRecord())
	  g_form.showErrorBox("condition", getMessage("Condition field should be specified to restrict execution of this UI Action to certain users. For example, current.canWrite() condition restricts the UI Action to the users who can modify the current record, gs.hasRole(\"admin\") condition restricts the UI Action to the users with admin role."));
}
