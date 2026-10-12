(function(context, pageParams, blockcontext) {
    // return some_output
    var filter = blockcontext.AvailablePluginsSelectedFilterItem;
    var workflowName = "";
    if (filter === "all")
        pList = NAAPluginUtil.getAvailablePluginsWithFilter();
    else {
        pList = NAAPluginUtil.getAvailablePluginsWithFilter(filter);
        workflowName = NAASkillFamilyUtil.getSkillFamilyName(filter);
    }

    var count = pList.length;
    var showGrid = true;
    var showEmptyList = false;
    if (count == 0) {
        showGrid = false;
        showEmptyList = true;
    }
    var allAvailableText = workflowName ? gs.getMessage("All available {0} plugins ({1})", [workflowName, count.toString()]) : gs.getMessage("All available plugins ({0})", [count.toString()]);

    return {
        pluginsList: pList,
        count: allAvailableText,
        showGrid: showGrid,
        showEmptyList: showEmptyList
    };
})(context, pageParams, blockcontext);
