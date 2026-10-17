function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;

    var LENS_LAUNCHER = 'lens_launcher';
    var buttonGR = new GlideRecord('sys_sg_button');
    buttonGR.addQuery('sys_id', g_form.getValue('button'));
    buttonGR.query();
    if (buttonGR.next() && buttonGR.getValue('type') === LENS_LAUNCHER)
        g_form.setValue("icon", "76d03b43ff6c721057e9ffffffffff1f");

}
