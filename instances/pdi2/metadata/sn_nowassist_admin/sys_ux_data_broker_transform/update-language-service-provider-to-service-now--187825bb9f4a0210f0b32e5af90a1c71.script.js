function transform(input) {
    try {
        var sysPropertiesGr = new GlideRecord('sys_properties');
        sysPropertiesGr.addQuery('name', 'com.snc.gen_ai.translator_configuration.sys_id');
        sysPropertiesGr.query();
        if (sysPropertiesGr.next()) {
            var id = sysPropertiesGr.getUniqueValue();
            var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
            naaGlobalUtil.updateRecord("sys_properties", id, {
                value: ""
            });
        }
    } catch (e) {
        gs.error("Failed to update language service provider to Service Now");
    }
}
