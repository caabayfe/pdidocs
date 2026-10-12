function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (g_form.getValue("work_note_field_name") == g_form.getValue("comment_field_name")) {
        g_form.addErrorMessage(getMessage("'Comment Field' cannot be same as 'Work Notes Field'. Please select the field which stores the comments mentioned for the records."));
		g_form.clearValue("comment_field_name");
        return false;
    }

}
