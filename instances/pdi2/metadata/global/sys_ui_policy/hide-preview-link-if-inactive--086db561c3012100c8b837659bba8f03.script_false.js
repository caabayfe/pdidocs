function onCondition() {
	var elem = $("element." + g_form.getTableName() + ".preview");
	var newForm = g_form.isNewRecord();
	
	if (elem) { 
		if(newForm)
			elem.hide();
		else
			elem.show();
	}
}
