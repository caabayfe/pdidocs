(function executeRule(current, previous /*null when async*/ ) {

    var setup_script = current.builder.setup_script.script;
	
    if (setup_script !== "") {
        var payload = {};
        payload["builder"] = current.builder.name.getDisplayValue();
        payload["capabilityId"] = current.definition.getValue("capability");
        payload["capabilityName"] = current.definition.capability.name.getDisplayValue();
        payload["definitionId"] = current.definition.getRefRecord().getUniqueValue();

        var attributes = sn_one_extend.OneExtendUtil.getDefinitionAttributes(payload["definitionId"]);
        payload["attributes"] = attributes;
        var className = current.builder.setup_script.name.toString();
        var scriptClass = global[className];
        if (typeof scriptClass === 'function' && typeof new scriptClass().setup === 'function') {
            try {
                new scriptClass().setup(payload);
            } catch (e) {
                gs.error("error in calling setup script " + className, e);
            }
        } else {
            gs.error("Setup script not found or 'setup' method is missing: " + className);
        }
    }

})(current, previous);
