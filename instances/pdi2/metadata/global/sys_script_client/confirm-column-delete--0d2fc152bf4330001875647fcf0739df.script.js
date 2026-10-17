function onSubmit() {
   var action = g_form.getActionName();
	if (action != 'drop_table_element')
		return;

	return confirm(getMessage('Delete this column?'));
   
}
