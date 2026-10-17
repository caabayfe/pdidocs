var GuidedSetupEntitlementsHelper = Class.create();
GuidedSetupEntitlementsHelper.prototype = {
    initialize: function() {},
    fetchEntitlements: function() {
        var entitlementArr = [];
	var entitlement = '';
        var conditions = '';
	var conditionsScript = '';

        var mappingGr = new GlideRecord("gs_entitlement_plugin_mapping");
	mappingGr.addActiveQuery();
        mappingGr.query();
        while (mappingGr.next()) {
            conditions = mappingGr.getValue('conditions');
            entitlement = mappingGr.getValue('entitlement');
            if (conditions.indexOf('source=') !== -1)
                conditionsScript = conditions.replace(/source=/g, "sn_lef.GlideEntitlement.hasLicenseForApp('");
            if (conditions.indexOf('^EQ') !== -1)
                conditionsScript = conditionsScript.replace("^EQ", "')");
            if (conditions.indexOf('^OR') !== -1)
                conditionsScript = conditionsScript.replaceAll("^OR", "') || ");
            if (conditions.indexOf('^') !== -1)
                conditionsScript = conditionsScript.replaceAll("^", "') && ");
            mappingGr.setValue('condition_script', conditionsScript);
            mappingGr.update();
            var evaluator = new GlideScopedEvaluator();
            if (evaluator.evaluateScript(mappingGr, 'condition_script'))
                entitlementArr.push(entitlement);
        }
        return entitlementArr;
    },
    type: 'GuidedSetupEntitlementsHelper'
};
