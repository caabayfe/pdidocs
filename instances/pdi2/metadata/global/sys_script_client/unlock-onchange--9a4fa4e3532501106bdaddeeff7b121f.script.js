function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    // Hide password reset only related fields, if reset is not selected
    var sections = g_form.getSections();
    var change = g_form.getValue('change');
    var reset = g_form.getValue('reset');
    if (newValue == 'true') {
        sections[1].style.display = 'block'; // details
        sections[2].style.display = 'block'; // advanced
        sections[3].style.display = 'block'; // enrollment
        g_form.showRelatedList("pwd_map_proc_to_verification");
    } else if (reset != "true") {
        g_form.setValue('public_access', false); // Disable public access option
        sections[1].style.display = 'none'; // details
        sections[2].style.display = 'none'; // advanced
        sections[3].style.display = 'none'; // enrollment
        g_form.hideRelatedList("pwd_map_proc_to_verification");
    }

}
