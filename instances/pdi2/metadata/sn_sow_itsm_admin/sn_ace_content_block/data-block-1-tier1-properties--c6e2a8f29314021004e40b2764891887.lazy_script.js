(function(context, pageParams, blockcontext) {
    // return some_output
    var configSettingGR = new GlideRecord('sn_sow_cfg_stg');
    configSettingGR.addQuery('group', '82ed0d8447404210f9bc5222516d4347'); // Group = Tier1
    configSettingGR.query();

    var tier1 = {};
    while (configSettingGR.next()) {
        var key = configSettingGR.getValue('key');
        var value = configSettingGR.getValue('value');
        tier1[key] = value;
    }

    return {
        tier1: tier1
    };

})(context, pageParams, blockcontext);
