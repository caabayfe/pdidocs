(function refineQuery(current, parent) {
    var currentContextId = parent.getUniqueValue();
    var currentContextTable = parent.getValue(sn_nb_action.Constants.COL_CONTEXT);
    var parentContextIds = [];
    var getRAParentContextMethods = new sn_nb_action.GetRAParentContextMethods();
    // Check for the first level parent context manually so in case of inactive current context the inherited rules should get rendered
    var ruleContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
    if (ruleContextGr.get(currentContextId)) {
        var parentContextId = ruleContextGr.getValue(sn_nb_action.Constants.COL_MAP_PARENT_CONTEXT);
        if (parentContextId) {
            var parentContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
            parentContextGr.addQuery(sn_nb_action.Constants.COL_SYS_ID, parentContextId);
            parentContextGr.addActiveQuery();
            parentContextGr.query();
            if (parentContextGr.next()) {
                var parentContextTable = parentContextGr.getValue(sn_nb_action.Constants.COL_CONTEXT);
                var expectedParentTables = getRAParentContextMethods.fetchParentTables(currentContextTable);
                if (expectedParentTables.includes(parentContextTable)) {
                    parentContextIds.push(parentContextId);
                    currentContextId = parentContextId;
                    currentContextTable = parentContextTable;
                } else {
                    gs.error("Inherited rules related list : Parent context table - " + parentContextTable + " is not a valid parent of the child context table - " + currentContextTable +
                        ", since the actual expected parent tables are - " + JSON.stringify(expectedParentTables));
                }
            }
        }
    }
    // Fetch additional hierarchical parents
    var additionalParents = new sn_nb_action.NextBestActionDAO().getHierarchicalParentContextIds(currentContextId, currentContextTable);
    parentContextIds = parentContextIds.concat(additionalParents);
    var query = current.addQuery(sn_nb_action.Constants.COL_ACTIVE, true);
    query.addCondition(sn_nb_action.Constants.COL_RULE_CONTEXT, 'IN', parentContextIds);
    query.addCondition(sn_nb_action.Constants.COL_APPLIES_TO_CHILD_TABLES, true);
    })(current, parent);
