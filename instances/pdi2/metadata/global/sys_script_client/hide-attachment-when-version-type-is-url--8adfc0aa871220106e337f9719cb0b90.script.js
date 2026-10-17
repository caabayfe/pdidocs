function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === 'attachment') {
		g_form.enableAttachments();
        return;
    } else
        g_form.disableAttachments();


    //Type appropriate comment here, and begin script below

}
