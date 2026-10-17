var grHarc = new GlideRecord('sn_vsc_instance_hardening_settings');
grHarc.addQuery('check', null);
grHarc.query();
while (grHarc.next()) {
    var harcId = grHarc.sys_id;
    //remove setting from configuration
    var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
    grConfig.addQuery('config_setting', 'CONTAINS', harcId);
    grConfig.query();
    if (grConfig.next()) {
        var settingArr = grConfig.config_setting.toString().split(',');
        if (settingArr.length > 1) {
            var pos = settingArr.indexOf(harcId);
            settingArr.splice(pos, 1);
            grConfig.config_setting = settingArr.toString();
            grConfig.update();
        } else {
            grConfig.deleteRecord();
        }
    }
    //remove setting and config groups
    grHarc.deleteRecord();
}
