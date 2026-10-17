function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (g_scratchpad.sys_mlb_enabled == 'false') return;

    var isULBSupported = false;
    var gr = new GlideRecord('pa_indicators');
    gr.addQuery('sys_id', g_scratchpad.sys_id);
    gr.query();
    while (gr.next()) {
        isULBSupported = gr.getValue('is_mlb_supported');
    }
    // show modal when Scripted is checked for ULB indicator
    if (newValue == 'true' && isULBSupported == 'true') {
        var dialog = new GlideModal('glide_modal_confirm', true, 300);
        dialog.setTitle(new GwtMessage().getMessage('Are you sure?'));
        dialog.setPreference('body', new GwtMessage().getMessage("If you use a scripted aggregate, this indicator will support no more than 2 levels of breakdowns. Are you sure you want to use a scripted aggregate? Scores will become available when the hourly conversion job has run."));
        dialog.setPreference('focusTrap', true);
        dialog.setPreference('onPromptCancel', doCancel);
        dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('Yes'));
        dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('No'));
        dialog.setWidth(550);
        dialog.render();
    }

    function doCancel() {
        g_form.getControl('ni.pa_indicators.scripted').checked = false;
        dialog.destroy();
    }

}
