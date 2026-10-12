(function(context, pageParams, blockcontext) {
    // return some_output
    var configSettingGR = new GlideRecord('sn_sow_cfg_stg');
    configSettingGR.addQuery('group', '37fd4d8447404210f9bc5222516d43c2'); // Group = Tier 2
    configSettingGR.query();

    var tier2 = {};
    while (configSettingGR.next()) {
        var key = configSettingGR.getValue('key');
        var value = configSettingGR.getValue('value');
        tier2[key] = value;
    }

    return {
        tier2: tier2
    };

})(context, pageParams, blockcontext);
