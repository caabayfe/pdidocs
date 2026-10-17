function transform(input) {
    var scope = "";
    var scopeName = "";
    try {
        var currentApplicationId = gs.getCurrentApplicationId();
        var sysPropertiesGr = new GlideRecord('sys_properties');
        sysPropertiesGr.addQuery('name', 'com.snc.gen_ai.translator_configuration.sys_id');
        sysPropertiesGr.query();
        if (sysPropertiesGr.next()) {
            scope = sysPropertiesGr.getValue('sys_scope');
            scopeName = sysPropertiesGr.getDisplayValue('sys_scope');
        }
    } catch (error) {
        gs.error("Failed to get the scope for translator configuration" + error);
    }
    return {
        currentApplicationId: currentApplicationId,
        currentScopeName: gs.getCurrentScopeName(),
        propertyScopeId: scope,
        propertyScopeName: scopeName,
        scopeMatch: (currentApplicationId === scope)
    };
}
