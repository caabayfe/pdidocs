(function executeRule(current, previous /*null when async*/ ) {
	if (shouldSkipExecution(current))
		return;
	
    if (current.cat_item != "") {
        var gr = new GlideRecord("io_set_item");
        gr.addQuery("sc_cat_item", current.cat_item);
        gr.query();
        while (gr.next())
            if (gr.variable_set.internal_name == current.name || gr.variable_set.title == current.name) {
                gs.addErrorMessage(gs.getMessage("The variable set {0} has the same name or title as a variable associated with the same catalog item '{1}'. Keep the names of variables and variable set internal name and title associated with a catalog item unique.", [gr.variable_set.internal_name + "", current.cat_item.name]));
                current.setAbortAction(true);
            }

        checkItem(current.cat_item.sys_id, current.cat_item.name, current.sys_id, current.name, null, null);
    }

    if (current.variable_set != "") {
        if (current.variable_set.internal_name == current.name || current.variable_set.title == current.name) {
            gs.addErrorMessage(gs.getMessage("This variable has the same name as the variable set '{0}' internal name or title. Keep the variable set internal name and title and the names of the variables associated with it unique.", [current.variable_set.internal_name]));
            current.setAbortAction(true);
        }

        var matchingVariableCount = 0;
        var gr = new GlideRecord("item_option_new");
        gr.addQuery("name", current.name);
        gr.addQuery("variable_set", current.variable_set);
        gr.query();
        while (gr.next())
            if (gr.sys_id != current.sys_id)
                matchingVariableCount++;
        if (matchingVariableCount > 0) {
            gs.addErrorMessage(gs.getMessage("The variable set {1} has {0} other variable(s) with the same name associated with it. Keep the names of variables associated with a variable set unique.", [parseInt(matchingVariableCount) + "", current.variable_set.internal_name]));
            current.setAbortAction(true);
        }

        gr = new GlideRecord("io_set_item");
        gr.addQuery("variable_set", current.variable_set);
        gr.query();
        while (gr.next()) {
            checkItem(gr.sc_cat_item.sys_id, gr.sc_cat_item.name, current.sys_id, current.name, current.variable_set.sys_id, current.variable_set.internal_name);
        }
    }

    function checkItem(item_id, item_name, var_id, var_name, exclude_set_id, exclude_set_name) {
        var matchingVariableCount = 0;
        var gr = new GlideRecord("item_option_new");
        gr.addQuery("name", var_name);
        gr.addQuery("cat_item", item_id);
        gr.query();
        while (gr.next())
            if (gr.sys_id != var_id)
                matchingVariableCount++;
        if (matchingVariableCount > 0) {
            gs.addErrorMessage(gs.getMessage("The catalog item {1} has {0} other variable(s) with the same name associated with it. Keep the names of variables associated with a catalog item unique.", [parseInt(matchingVariableCount) + "", item_name]));
            current.setAbortAction(true);
        }

        var gr = new GlideRecord("io_set_item");
        gr.addQuery("sc_cat_item", item_id);
        gr.query();
        while (gr.next()) {
            if (exclude_set_id == gr.variable_set)
                continue;
            var setVariableCount = 0;
            var vr = new GlideRecord("item_option_new");
            vr.addQuery("name", var_name);
            vr.addQuery("variable_set", gr.variable_set);
            vr.query();
            while (vr.next())
                if (vr.sys_id != var_id)
                    setVariableCount++;
            if (setVariableCount > 0) {
                gs.addErrorMessage(gs.getMessage("There are {0} other variable(s) with the same name associated with the variable set '{1}', which is linked to the catalog item '{2}'. Keep the names of variables and variable set internal name and title associated with a catalog item unique.", [parseInt(setVariableCount) + "", gr.variable_set.internal_name + "", item_name]));
                current.setAbortAction(true);
            }
        }
    }
	function shouldSkipExecution(current) {
		
		return shouldSkipByProcess(current) || ((current.operation() != 'insert') && !(current.name.changes() || (current.cat_item.changes() || current.variable_set.changes() || current.active.changesTo(true))));

	}
	function shouldSkipByProcess(current) {
		return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout','publish']);
	}
})(current, previous);
