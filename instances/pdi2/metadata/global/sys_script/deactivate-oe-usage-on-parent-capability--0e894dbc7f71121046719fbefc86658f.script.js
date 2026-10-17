(function executeRule(current, previous /*null when async*/) {
    var parentCapability = current.from_resource.parent_capability;
    var definitions = [];

    // Get list of definitions for current parent capability
    var definitionGr = new GlideRecord("sys_one_extend_capability_definition");
    definitionGr.addQuery("capability", parentCapability);
    definitionGr.query();
    while(definitionGr.next()) {
        definitions.push(definitionGr.getValue("sys_id"));
    }

    // Check active OE usages for any definition of the current parent capability
    var usageGr = new GlideRecord("sys_one_extend_usage");
    usageGr.addActiveQuery();
    usageGr.query();
    while(usageGr.next()) {
        var usageDefinitions = usageGr.getValue("definition");
        if (usageDefinitions) {
            usageDefinitions.split(',').forEach(function (definitionId) {
                if (definitions.indexOf(definitionId) >= 0) {
                    usageGr.active = false;
                    usageGr.update();
                }
            });
        }
    }
})(current, previous);
