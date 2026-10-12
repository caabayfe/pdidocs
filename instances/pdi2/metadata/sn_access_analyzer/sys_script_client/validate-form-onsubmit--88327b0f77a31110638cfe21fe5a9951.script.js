function onSubmit() {

	g_form.hideAllFieldMsgs();
	
    var resourceType = g_form.getValue("resource_type");
    var operations = g_form.getValue('operations').split(/[ ,]+/);
	var targetField = g_form.getValue("target_field");
	
	var so = g_scratchpad.sysSecurityOperations;

	operations = operations.map( function(o){
		return so[o];
	});

    var allowedOpr = [];

    switch (resourceType) {
        case 'ui_page':
            allowedOpr = ['read'];
            break;
        case 'client_callable_script_include':
        case 'rest_endpoint':
        case 'processor':
			allowedOpr = ['execute'];
			break;
        case 'record':
            allowedOpr = ['write', 'create', 'read',
                'save_as_template', 'add_to_list', 'list_edit',
                'report_on', 'report_view', 'personalize_choices'
            ];
			
			if(targetField == null || targetField.trim() == '') {
				allowedOpr.push('delete');
			} else {
				resourceType = 'Field';
			}
    }

    var res = [];

    operations.forEach(function(opr) {
        if (allowedOpr.indexOf(opr) == -1) {
            res.push(opr);
        }
    });

    if (res.length > 0) {
    	g_form.showFieldMsg("operations", new GwtMessage().getMessage("[{0}] operation(s) are not allowed in {1} evaluation", res.join(","), resourceType), 'error');
		return false;
    }

    return true;

}
