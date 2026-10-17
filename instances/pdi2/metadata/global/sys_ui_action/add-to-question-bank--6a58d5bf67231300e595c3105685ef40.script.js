function addCategoryToBank() {
	var gajax = new GlideAjax("AssessmentUtilsAJAX");
	gajax.addParam("sysparm_name", 'processBankAction');
	gajax.addParam("sysparm_action", "add_category_to_bank");
	gajax.addParam("sysparm_from_list_id", g_list.getChecked());
	gajax.getXMLAnswer(addedCategoriesToBank);
}

function addedCategoriesToBank(){
// 	var message = getMessage('Added categories to Question Bank');
// 	g_form.addInfoMessage(message);
	reloadWindow(getMainWindow());
	
}
