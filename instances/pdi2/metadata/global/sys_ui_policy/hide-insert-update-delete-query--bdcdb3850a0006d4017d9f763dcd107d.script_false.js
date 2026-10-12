function onCondition() {
		g_form.setVisible('action_insert', true);
		g_form.setVisible('action_update', true);
		if (g_form.getValue('advanced') == 'true') {
			g_form.setDisplay('action_delete', true);
			g_form.setDisplay('action_query', true);
		}
}
