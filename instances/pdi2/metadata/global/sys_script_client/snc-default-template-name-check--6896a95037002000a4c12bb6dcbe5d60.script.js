function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '')
        return;

    //If the new value for the name field matches a table name
	newValue = newValue.toLowerCase().trim().split(' ').join('_');

    var tblVerifier = new GlideAjax("TableVerifier");
    tblVerifier.addParam("sysparm_name", 'tableExists');
    tblVerifier.addParam("sysparm_table_name", newValue);
    tblVerifier.getXMLAnswer(function(answer) {
        if (answer === 'true') { // There is a table with matching name
            if (g_user.hasRole('admin')) {
                g_form.showFieldMsg('name', 'Name matches an existing table name, so template will be automatically applied to new records in that table', 'info');
                g_form.setValue("table", newValue);
                return;
			}
			
			g_form.setValue("name", "");
			g_form.showFieldMsg('name', 'Name cannot match an existing table name', 'error');
			return;
        }
    });
}
