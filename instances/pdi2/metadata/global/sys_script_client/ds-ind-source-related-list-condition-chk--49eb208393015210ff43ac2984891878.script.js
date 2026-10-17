function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === "") {
        return;
    }

    if (g_scratchpad.sys_mlb_enabled == 'false') return;

    var gr = new GlideRecord('pa_cubes');
    gr.get(newValue);
    // Indicator source contains related list condition
    if (gr.getValue('conditions').indexOf("RLQUERY") !== -1) {
        renderDialog();
    }

    function renderDialog() {
        var dialog = new GlideModal("glide_modal_confirm", true, 300);
        dialog.setTitle(new GwtMessage().getMessage("Are you sure?"));
        dialog.setPreference("body", new GwtMessage().getMessage("If you use an indicator source with related list conditions, this indicator will support no more than 2 levels of breakdowns. Are you sure you want to use an indicator source with related list conditions?"));
        dialog.setPreference("focusTrap", true);
        dialog.setPreference("onPromptCancel", doCancel);
        dialog.setPreference("buttonLabelComplete", new GwtMessage().getMessage("Yes"));
        dialog.setPreference("buttonLabelCancel", new GwtMessage().getMessage("No"));
        dialog.setWidth(550);
        dialog.render();
    }

    function doCancel() {
        // reset display value
        g_form.getControl("sys_display.pa_indicators.cube").value =
            g_form.getControl("sys_display.original.pa_indicators.cube").value;

        // reset pa_cube sys_id
        control.setValue(oldValue);
    }
}
