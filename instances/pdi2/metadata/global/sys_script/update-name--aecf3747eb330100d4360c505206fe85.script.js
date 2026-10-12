(function executeRule(current, previous /*null when async*/ ) {
	if (shouldSkipExecution(current))
		return;

    if (current.map_to_field == false && current.name == "") {
        var name = "formatter";
        var varsGr = getVarsWithName(name, current.cat_item, current.sys_id, current.variable_set);
        var nameMap = {};
        while (varsGr.next())
            nameMap[varsGr.name + ''] = varsGr.sys_id + '';
        if (nameMap[name] && nameMap[name] != current.sys_id) {
            for (var i = 2; i < 1000; i++) {
                var proposed_name = name + i;
                if (!nameMap[proposed_name] || nameMap[proposed_name] == current.sys_id) {
                    name = proposed_name;
                    break;
                }
            }
        }
        current.field = "";
        current.name = name;

        // Keep field value cleared when map_to_field is false
    } else if (current.map_to_field == false)
        current.field = "";

    function getVarsWithName(name, item_id, sys_id, varset_id) {
        var variables = new GlideRecord('item_option_new');
        variables.addQuery('name', 'STARTSWITH', name);
        if (!gs.nil(item_id))
            variables.addQuery('cat_item', item_id);
        else if (!gs.nil(varset_id))
            variables.addQuery('variable_set', varset_id);
        else {
            variables.addNullQuery('cat_item');
            variables.addNullQuery('variable_set');
        }
        variables.query();
        return variables;
    }

	function shouldSkipExecution(current) {
        return shouldSkipByProcess(current);
    }

    function shouldSkipByProcess(current) {
        return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout']);
    }
})(current, previous);
