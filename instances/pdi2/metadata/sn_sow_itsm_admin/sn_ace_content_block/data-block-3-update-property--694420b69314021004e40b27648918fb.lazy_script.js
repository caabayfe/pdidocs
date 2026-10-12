(function(context, pageParams, blockcontext) {
    // return some_output
    var configSettingGR = new GlideRecord('sn_sow_cfg_stg');
    configSettingGR.addQuery('group', blockcontext.variant);
    configSettingGR.addQuery('key', blockcontext.sectionProperty);
    configSettingGR.query();

    if (configSettingGR.next()) {
        configSettingGR.setValue('value', configSettingGR.getValue('value') == 'true' ? 'false' : 'true');
        configSettingGR.update();
    } else {
        configSettingGR.initialize();
        configSettingGR.setValue('key', blockcontext.sectionProperty);
        configSettingGR.setValue('group', blockcontext.variant);
        configSettingGR.setValue('value', 'false');
        configSettingGR.insert();
    }
})(context, pageParams, blockcontext);
