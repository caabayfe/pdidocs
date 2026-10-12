function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
        return;
    }
	
	var nonChoiceIntegerGa = new GlideAjax('global.ProminUtilsAJAX');
    nonChoiceIntegerGa.addParam('sysparm_name', 'isNonChoiceIntegerField');
    nonChoiceIntegerGa.addParam('sysparm_table', g_form.getReference('entity').table);
    nonChoiceIntegerGa.addParam('sysparm_field', g_form.getValue("field"));
    nonChoiceIntegerGa.getXML(isNonChoiceIntegerFieldFunctionResponse);

    function isNonChoiceIntegerFieldFunctionResponse(response) {
		var isNonIntegerField = response.responseXML.documentElement.getAttribute("answer");
		var hideChooseValues = (isNonIntegerField == 'true');
		if(hideChooseValues){
			g_form.setDisplay('field_values_selection_type',false);
			g_form.setValue("field_values_selection_type", "ALL");
		}else{
			g_form.setDisplay('field_values_selection_type',true);
		}
	}


}
