function onChange(control, oldValue, newValue, isLoading) {

    if (isLoading || newValue == '') {
        return;
    }

    if (newValue === "business_rule") {
        g_form.showFieldMsg("iar_invocation", getMessage("Automatic IAR invocation adds a business rule on the target table to trigger the IAR process. Disable any existing business rules for on-demand invocation to ensure the IAR process runs only once."), "info");
    } else {
        g_form.hideFieldMsg("iar_invocation", true);
    }

}
