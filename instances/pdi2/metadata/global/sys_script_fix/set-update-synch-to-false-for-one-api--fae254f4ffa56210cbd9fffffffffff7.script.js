if (!pm.isZboot()) {
    var oneApiTables = ["one_api_service_plan", "one_api_service_plan_feature", "one_api_feature", "one_api_feature_provider", "one_api_service_plan_feature_edge"];

    for (var tableIdx in oneApiTables) {
        makeUpdateSyncFalse(oneApiTables[tableIdx]);
    }
}

function makeUpdateSyncFalse(tableName) {
    var dbObjGr = new GlideRecord("sys_db_object");
    dbObjGr.addQuery("name=" + tableName + "^super_classISNOTEMPTY");
    dbObjGr.query();
    //if the table schema is extending sys_metadata table
    if (dbObjGr.next()) {
        // Find the table's sys_id
        var oneApiTable = new GlideRecord("sys_dictionary");
        oneApiTable.addQuery("name", tableName);
        oneApiTable.addQuery("element", "");
        oneApiTable.query();
        if (!oneApiTable.next() || oneApiTable.hasNext()) {
            gs.warn('Searching for a single ' + tableName + ' record in the ' +
                'sys_dictionary table failed. Not modifying update_synch attribute');
            return;
        }
        // Attributes are a comma separated list
        var attributes = oneApiTable.getValue("attributes").split(",");
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].indexOf("update_synch") == 0) {
                attributes[i] = "update_synch=false";
                oneApiTable.setValue("attributes", attributes.join(","));
                oneApiTable.update();
                break;
            }
        }
        // Find the table's update_synch attribute
        var updateSynchAttribute = new GlideRecord("sys_schema_attribute_m2m");
        updateSynchAttribute.addQuery("schema", oneApiTable.getUniqueValue());
        // Update synch attribute sys_id is always the same
        updateSynchAttribute.addQuery("attribute", "eb8ce330eb321100d4360c505206feac");
        updateSynchAttribute.query();
        updateSynchAttribute.setValue("value", "false");
        if (updateSynchAttribute.next()) {
            updateSynchAttribute.update();
        } else {
            updateSynchAttribute.setValue("schema", oneApiTable.getUniqueValue());
            updateSynchAttribute.setValue("attribute", "eb8ce330eb321100d4360c505206feac");
            updateSynchAttribute.insert();
        }
    }
}
