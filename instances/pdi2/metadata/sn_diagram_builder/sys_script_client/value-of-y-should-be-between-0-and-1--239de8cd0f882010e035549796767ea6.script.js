function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var y = parseFloat(g_form.getValue("y"));

    if (y < 0 || y > 1)
        g_form.showFieldMsg("y", "Value of Y should be between 0 and 1", "error");

}
