(function executeRule(current, previous) {
    // Setup
    g_scratchpad.recordCount = 0;
    if (gs.nil(current.datasource)) return;

    // Get Indexed Source filter (possibly ^NQ-separated conditions)
    var indexedSourceFilter = new sn_ais.AisUtil().getTableLevelAttribute(current.datasource.source, 'filter', '');
    var indexedSourceFilters = indexedSourceFilter.split('^NQ').filter(Boolean);

    // Get Search Source filter (possibly ^NQ-separated conditions)
    var searchSourceFilter = current.condition || '';
    var searchSourceFilters = searchSourceFilter.split('^NQ').filter(Boolean);

    // Build sys_class_name conditions (main & child tables)
    var tableConditions = [];
    if (new GlideRecord(current.datasource).isValidField('sys_class_name')) {
        tableConditions.push("sys_class_name=" + current.getValue("datasource"));
    }
    var childTablesGr = new GlideRecord('ais_child_table');
    childTablesGr.addQuery("datasource", current.datasource.sys_id);
    childTablesGr.addQuery("active", "true");
    childTablesGr.query();
    while (childTablesGr.next()) {
        tableConditions.push("sys_class_name=" + childTablesGr.getValue("table"));
    }
    var tableConditionStr = tableConditions.join("^OR");

    // Final combined conditions via nested loop
    var finalConditions = [];
    indexedSourceFilters = indexedSourceFilters.length ? indexedSourceFilters : [''];
    searchSourceFilters = searchSourceFilters.length ? searchSourceFilters : [''];
    for (var i = 0; i < indexedSourceFilters.length; i++) {
        for (var j = 0; j < searchSourceFilters.length; j++) {
            var parts = [];
            if (indexedSourceFilters[i]) parts.push(indexedSourceFilters[i]);
            if (searchSourceFilters[j]) parts.push(searchSourceFilters[j]);
            if (tableConditionStr) parts.push(tableConditionStr);

            var condition = parts.join('^');
            if (condition) finalConditions.push(condition);
        }
    }
    var assembledCondition = finalConditions.join('^NQ');

    // Count records using GlideAggregate
    var count = new GlideAggregate(current.datasource);
    count.addAggregate('COUNT');
    count.addEncodedQuery(assembledCondition, true);
    count.query();
    if (count.next()) {
        g_scratchpad.recordCount = count.getAggregate('COUNT');
    }

    g_scratchpad.adjustedCondition = encodeURIComponent(encodeURIComponent(assembledCondition));
})(current, previous);
