(function executeRule(current, previous /*null when async*/ ) {
	if (shouldSkipExecution(current))
		return;
	
    var shouldCheckName = false;

    if (current.operation() == 'insert')
        shouldCheckName = true;

    if (current.operation() == 'update' && !JSUtil.nil(current.sc_cat_item) && !JSUtil.nil(current.variable_set) && (current.sc_cat_item.changes() || current.variable_set.changes())) {
        shouldCheckName = true;
    }

    if (shouldCheckName) {
        var catItemSysId = current.sc_cat_item;
        var varSetId = current.variable_set;

        var catItemName = current.sc_cat_item.name;
        var varSetName = current.variable_set.internal_name;

        var varSetNameMap = {};
        varSetNameMap[current.variable_set.internal_name] = current.variable_set.internal_name;
        varSetNameMap[current.variable_set.title] = current.variable_set.internal_name;

        var sets = varSetId + '';
        var itemVariableSets = new GlideRecord("io_set_item");
        itemVariableSets.addQuery("sc_cat_item", catItemSysId);
        itemVariableSets.query();
        while (itemVariableSets.next()) {
            if (sets.length > 0)
                sets += ',';
            sets += itemVariableSets.variable_set;
            varSetNameMap[itemVariableSets.variable_set.internal_name] = itemVariableSets.variable_set.internal_name;
            varSetNameMap[itemVariableSets.variable_set.title] = itemVariableSets.variable_set.internal_name;
        }

        var gr = new GlideRecord("item_option_new");
        gr.addActiveQuery();
        var qc = gr.addQuery("variable_set", "IN", sets).addOrCondition("cat_item", catItemSysId);
        gr.query();

        var variableNameMap = {};
        var catItemNameMap = {};
        var checkNameCollisonMap = {};

        while (gr.next()) {
            var name = gr.getValue('name');
            var varSysId = gr.getValue('sys_id');
            var item_id = gr.getValue('cat_item');
            var set_id = gr.getValue('variable_set');

            if (!JSUtil.nil(item_id)) {
                if (catItemNameMap.hasOwnProperty(name)) {
                    catItemNameMap[name].count = catItemNameMap[name].count + 1;
                } else {
                    catItemNameMap[name] = {
                        sys_id: varSysId,
                        count: 1
                    };
                }
            } else if (!JSUtil.nil(set_id)) {
                // don't add the vsSet to the variableSetNameMap, if the currentVariableSet is same as associating variableSet
                var setName = gr.variable_set.internal_name;
                if (set_id == varSetId) {
                    checkNameCollisonMap[name] = {
                        sys_id: varSysId,
                        count: 1
                    };
                } else {
                    if (variableNameMap.hasOwnProperty(name)) {
                        vsObject = variableNameMap[name];
                        if (vsObject.hasOwnProperty(set_id)) {
                            variableNameMap[name][set_id].count++;
                        } else {
                            variableNameMap[name].set_id = {
                                vs_name: setName,
                                count: 1
                            };
                        }
                    } else {
                        variableNameMap[name] = {};
                        var vsObject = {};
                        vsObject[set_id] = {
                            vs_name: setName,
                            count: 1
                        };
                        variableNameMap[name] = vsObject;
                    }
                }
            }
        }

        for (var name in checkNameCollisonMap) {
            if (catItemNameMap.hasOwnProperty(name) && catItemNameMap[name].sys_id != checkNameCollisonMap[name].sys_id) {
                addItemErrorMessage(catItemNameMap[name].count, name, catItemName, varSetName);
                current.setAbortAction(true);
            }
        }

        for (var name in checkNameCollisonMap) {
            // if any of the variable-set;s include a variable which has same name as our vset.
            if (variableNameMap.hasOwnProperty(name)) {
                for (var set_id in variableNameMap[name]) {
                    addVSErrorMessage(variableNameMap[name][set_id].count, name, catItemName, variableNameMap[name][set_id].vs_name, varSetName);
                    current.setAbortAction(true);
                    break;
                }
            }
        }

        var errMsgs = {
            itemVarNameError: [],
            includeVarSetNameError: [],
            currentVarSetNameError: []
        };

        for (var name in varSetNameMap) {
            if (catItemNameMap.hasOwnProperty(name)) {
                errMsgs.itemVarNameError.push(gs.getMessage("There is {0} variables(s) with name '{1}' associated with the catalog item '{2}', which has same name as variable set '{3}' internal name or title", [catItemNameMap[name].count, name, catItemName, varSetNameMap[name]]));
                current.setAbortAction(true);
            }

            if (variableNameMap.hasOwnProperty(name)) {
                for (var set_id in variableNameMap[name]) {
                    errMsgs.includeVarSetNameError.push(gs.getMessage("There is {0} variable(s) with name '{1}' associated with the variable set '{2}', which is linked to the catalog item '{3}', which has same name as variable set '{4}' internal name or title", [variableNameMap[name][set_id].count, name, variableNameMap[name][set_id].vs_name, catItemName, varSetNameMap[name]]));
                    current.setAbortAction(true);
                }
            }

            if (checkNameCollisonMap.hasOwnProperty(name)) {
                errMsgs.currentVarSetNameError.push(gs.getMessage("There is {0} variable(s) with name '{1}' associated with the variable set '{2}', which has same name as variable set '{3}' internal name or title, which is linked to the catalog item '{4}'", [checkNameCollisonMap[name].count, name, varSetName, varSetNameMap[name], catItemName]));
                current.setAbortAction(true);
            }
        }

        pushErrMsgs(errMsgs);
    }

    function addItemErrorMessage(count, variableName, catalogItemName, variableSetName) {
        gs.addErrorMessage(gs.getMessage("There is {0} other variable(s) with name '{1}' associated with the catalog item '{2}', which includes variable set '{3}'", [count, variableName, catalogItemName, variableSetName]));
    }

    function addVSErrorMessage(count, variableName, catalogItemName, vsName, associatingVSName) {
        gs.addErrorMessage(gs.getMessage("There is {0} other variable(s) with name '{1}' associated with the variable set '{2}', which is linked to the catalog item '{3}', which includes variable set '{4}'", [count, variableName, vsName, catalogItemName, associatingVSName]));
    }

    function pushErrMsgs(errMsgs) {
        for (var key in errMsgs) {
            for (var i in errMsgs[key]) {
                gs.addErrorMessage(errMsgs[key][i]);
            }
        }
    }

	function shouldSkipExecution(current) {
		return shouldSkipByProcess(current);
	}
	function shouldSkipByProcess(current) {
		return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout','publish']);
	}
})(current, previous);
