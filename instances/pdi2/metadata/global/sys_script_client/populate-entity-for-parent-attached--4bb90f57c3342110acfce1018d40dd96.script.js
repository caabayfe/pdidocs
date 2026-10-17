function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	g_form.setValue("track_change", false);
    g_form.setValue("attached_entity", "");
    var changeName = "";
	var isReadOnly = false;
    if (newValue == "PARENT_ATTACHED") {
        var parentEntity = g_form.getReference("entity").parent_entity;
        if (parentEntity) {
            g_form.setValue("attached_entity", parentEntity);
            changeName = g_form.getDisplayBox('attached_entity').value + " Attached";
            isReadOnly = true;
        }
    }
	if(newValue !== 'DEFAULT'){
		g_form.setValue("track_change", true);
	}
	g_form.setReadOnly("attached_entity", isReadOnly);
    g_form.setValue("change_name", changeName); 
}
