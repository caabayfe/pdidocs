(function executeFixScriptForUpgradedCustomersToSetDefaultTheme() {
    const POLARIS_THEME_SYS_ID = '31bf91ae07203010e03948f78ad30095';
    const NEXT_EXPERIENCE_PROPERTY = 'glide.ui.polaris.experience';

    var nextExperiencePropertyValue = gs.getProperty(NEXT_EXPERIENCE_PROPERTY, 'false');

    if (nextExperiencePropertyValue == 'true') {
        var nativeClientGR = new GlideRecord('sys_sg_native_client');

        nativeClientGR.addQuery('mobile_theme', '');
        nativeClientGR.query();

        while (nativeClientGR.next()) {
            nativeClientGR.setValue('mobile_theme', POLARIS_THEME_SYS_ID);
            nativeClientGR.update();
            gs.info('Updated default theme to Polaris');
        }
    }
})();
