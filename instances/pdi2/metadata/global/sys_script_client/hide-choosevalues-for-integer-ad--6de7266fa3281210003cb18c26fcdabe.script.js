function onLoad() {
  
	var nonChoiceIntGa = new GlideAjax('global.ProminUtilsAJAX');
    nonChoiceIntGa.addParam('sysparm_name', 'isNonChoiceIntegerField');
    nonChoiceIntGa.addParam('sysparm_table', g_form.getReference('entity').table);
    nonChoiceIntGa.addParam('sysparm_field', g_form.getValue("field"));
    nonChoiceIntGa.getXML(isNonChoiceIntegerFieldResponse);

    function isNonChoiceIntegerFieldResponse(response) {
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
