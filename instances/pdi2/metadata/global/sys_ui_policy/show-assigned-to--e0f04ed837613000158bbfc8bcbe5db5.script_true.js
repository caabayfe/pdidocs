function onCondition() {
    var reserved = g_form.getValue('reserved_for');
    if (reserved != '')
		g_form.setValue('assigned_to', reserved); 
}
