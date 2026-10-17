function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '' || !g_form.isNewRecord()) {
        return;
    }

    var shortDescriptionKey = newValue + ".task.short_description";
    var detailsKey = newValue + ".task.details";
	//Update short description and details
    getMessage(shortDescriptionKey, function(msg) {
        g_form.setValue('short_description', msg);
    });
    getMessage(detailsKey, function(msg) {
        g_form.setValue('details', msg);
    });
}
