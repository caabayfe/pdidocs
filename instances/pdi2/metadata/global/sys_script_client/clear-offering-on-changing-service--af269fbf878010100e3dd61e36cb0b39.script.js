function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    if (oldValue && g_scratchpad.formValue === undefined) {
        g_scratchpad.formValue = oldValue;
    }
    if (!g_scratchpad.formValue && g_form.getValue("service_offering")) {
        var soGr = new GlideRecord('service_offering');
        soGr.addQuery('parent.sys_id', newValue);
        soGr.addQuery('sys_id', g_form.getValue("service_offering"));
        soGr.setLimit(1);
        soGr.query(offeringLookupCallback);
    } else
        g_form.clearValue('service_offering');

    if (g_scratchpad.formValue != newValue)
        g_scratchpad.formValue = newValue;
}

function offeringLookupCallback(soGr) {
    if (!soGr.hasNext())
        g_form.clearValue('service_offering');
}
