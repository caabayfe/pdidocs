function onSubmit() {
    var relationshipType = g_form.getValue("relation_type");
	var source_field = g_form.getValue("source_field");
	var target_field = g_form.getValue("target_field");
    if (relationshipType != '' && source_field == '' && target_field == '') {
		g_form.addErrorMessage(getMessage("Source and Target field cannot be empty. Please use search icon to select the field."));
		return false;
    }
}
