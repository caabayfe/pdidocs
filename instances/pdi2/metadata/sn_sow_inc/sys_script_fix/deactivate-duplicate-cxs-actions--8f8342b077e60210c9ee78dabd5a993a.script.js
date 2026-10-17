function deactiveDuplicateActions() {
    var actions = [{
            original: "7a02029353c4230005ecddeeff7b123b",
            duplicate: "ca8982cd77300110b3771aceca5a9997"
        },
        {
            original: "eb06a7ee536033009651ddeeff7b12ee",
            duplicate: "6f57c24d77300110b3771aceca5a9950"
        },
        {
            original: "f9bfc01987012300fb3ad61e36cb0bc5",
            duplicate: "bb335a0977700110b3771aceca5a9919"
        }
    ];
    var duplicateActions = actions.map(function(action) {
        return action.duplicate;
    });
    var duplicateActionConfigs = [];
    var tableConfigArray = getActiveTableConfigs();

    tableConfigArray.forEach(function(configSysId) {
        actions.forEach(function(action) {
            var searchActionConfig = new GlideAggregate("cxs_ui_action_config");
            searchActionConfig.addQuery("search_ui_config", configSysId);
            searchActionConfig.addQuery("search_ui_action", "IN", [action.original, action.duplicate].join(","));
            searchActionConfig.groupBy("search_res_config");
            searchActionConfig.addAggregate("GROUP_CONCAT", "sys_id");
            searchActionConfig.query();

            while (searchActionConfig.next()) {
                if (searchActionConfig.getAggregate("GROUP_CONCAT", "sys_id").split(",").length > 1)
                    duplicateActionConfigs.push(searchActionConfig.getAggregate("GROUP_CONCAT", "sys_id"));
            }
        });
    });

    var searchActionConfig = new GlideRecord("cxs_ui_action_config");
    searchActionConfig.addQuery("sys_id", "IN", duplicateActionConfigs.join(","));
    searchActionConfig.addQuery("search_ui_action", "IN", duplicateActions.join(","));
    searchActionConfig.query();
    while (searchActionConfig.next()) {
        gs.info("Deactivating duplicate action config: " + searchActionConfig.getUniqueValue());
        searchActionConfig.setValue("active", false);
        searchActionConfig.update();
    }

    deactivateEmptyActionConfigs();
}

function getActiveTableConfigs() {
    var tableConfigGr = new GlideRecord("cxs_table_config");
    tableConfigGr.addQuery("active", true);
    tableConfigGr.query();
    var tableConfigs = [];
    while (tableConfigGr.next()) {
        tableConfigs.push(tableConfigGr.getUniqueValue());
    }
    return tableConfigs;
}

function deactivateEmptyActionConfigs() {
    var actionConfigGR = new GlideRecord("cxs_ui_action_config");
    actionConfigGR.addEncodedQuery("search_ui_actionISEMPTY");
    actionConfigGR.query();
    while (actionConfigGR.next()) {
        gs.info("Deactivating action config: " + actionConfigGR.getUniqueValue());
        actionConfigGR.setValue("active", false);
        actionConfigGR.update();
    }
}

deactiveDuplicateActions();
