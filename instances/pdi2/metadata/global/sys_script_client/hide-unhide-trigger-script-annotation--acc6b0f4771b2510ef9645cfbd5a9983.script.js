function onChange() {
    if (!g_user.hasRole("sn_on_call_admin") && g_form.getValue('trigger_action') == 'script') {
        // Show the annotation
        if ($('trigger_script_annotation'))
            $('trigger_script_annotation').up().show();
    } else {
        // Hide the annotation
        if ($('trigger_script_annotation'))
            $('trigger_script_annotation').up().hide();
    }
}
