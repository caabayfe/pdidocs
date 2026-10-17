function onLoad() {
    g_form.clearOptions('type');
    var mobileAppOptions = g_scratchpad.mobileAppTypeOptions;
    for (var key in mobileAppOptions)
        g_form.addOption('type', key, mobileAppOptions[key]);

    var currentMobileAppType = g_scratchpad.currentMobileAppType;
    if (!currentMobileAppType) {
        var options = g_form.getElement('type').options;
        if (options.length > 0)
            currentMobileAppType = options[0].value;
    }

    g_form.setValue('type', currentMobileAppType);

}
