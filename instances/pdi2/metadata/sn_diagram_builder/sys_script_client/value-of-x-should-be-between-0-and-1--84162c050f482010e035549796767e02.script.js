function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var x = parseFloat(g_form.getValue("x"));

    if (x < 0 || x > 1)
        g_form.showFieldMsg("x", "Value of X should be between 0 and 1", "error");

}
