function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (newValue === "true") {
        g_form.setDisplay("preprocessor", true);
        g_form.setDisplay("postprocessor", true);
        return;
    } else {
        g_form.setDisplay("preprocessor", false);
        g_form.setDisplay("postprocessor", false);
        return;
    }

    //Type appropriate comment here, and begin script below

}
