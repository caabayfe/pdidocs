(function(context, pageParams, blockcontext) {
    // return some_output
    var filter = pageParams.workflow;
    var workflowName = "";
    if (filter === undefined)
        filter = "all";
        
    var pList;
    if (filter == "all")
        pList = NAAPluginUtil.getFormatedPlugins();
    else {
        pList = NAAPluginUtil.getFormatedPlugins(filter);
        workflowName = NAASkillFamilyUtil.getSkillFamilyName(filter);
    }

    var targetAvailablePluginsList = pList.targetAvailablePluginsList;
    var targetInstalledPluginsList = pList.targetInstalledPluginsList;

    var count = targetAvailablePluginsList.length;
    var filterOptions = NAAPluginUtil.getPluginFilterOptions();

    var showGrid = true;
    var showEmptyList = false;
    if (count == 0) {
        showGrid = false;
        showEmptyList = true;
    }

    var allAvailableText = workflowName ? gs.getMessage("All available {0} plugins ({1})", [workflowName, count.toString()]) : gs.getMessage("All available plugins ({0})", [count.toString()]);

    var installedPluginsRowObject = {
        "selectionEnabled": false,
        "rows": targetInstalledPluginsList
    };
    var installedPluginsColumns = {
        "columns": [{
                "key": "status",
                "type": "custom",
                "label": gs.getMessage("Status"),
                "width": "15%",
                "componentTag": "now-highlighted-value",
                "cellEditingDisabled": true
            },
            {
                "key": "pluginName",
                "type": "string",
                "label": gs.getMessage("Plugin Name"),
                "cellEditingDisabled": true
            }
        ]
    };
    var installedPluginsCount = targetInstalledPluginsList.length;
    var countTextTranslation = gs.getMessage("Installed ");
    var countText = countTextTranslation + "(" + installedPluginsCount + ")";

    return {
        pluginsList: targetAvailablePluginsList,
        pluginsCount: allAvailableText,
        selectedFilter: filter,
        filterOptions: filterOptions,
        showGrid: showGrid,
        showEmptyList: showEmptyList,
        installedPluginsRows: installedPluginsRowObject,
        installedPluginsColumns: installedPluginsColumns,
        installedPluginsCount: countText,
        selectedTabIndex: pageParams.installed ? 1 : 0
    };

})(context, pageParams, blockcontext);
