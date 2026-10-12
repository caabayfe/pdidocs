if (!pm.isZboot()) {
    var oneExtendTables = ["sys_gen_ai_model_availability"];

   for (var i = 0; i < oneExtendTables.length; i++) {
        oneExtendTables(oneExtendTables[i]);
    }
}

function makeUpdateSyncFalse(tableName) {
    var dbObjGr = new GlideRecord("sys_db_object");
    dbObjGr.addQuery("name=" + tableName + "^super_classISNOTEMPTY");
    dbObjGr.query();
    //if the table schema is extending sys_metadata table
    if (dbObjGr.next()) {
        // Find the table's sys_id
        var oneExtendTable = new GlideRecord("sys_dictionary");
        oneExtendTable.addQuery("name", tableName);
        oneExtendTable.addQuery("element", "");
        oneExtendTable.query();
        if (!oneExtendTable.next() || oneExtendTable.hasNext()) {
            gs.warn('Searching for a single ' + tableName + ' record in the ' +
                'sys_dictionary table failed. Not modifying update_synch attribute');
            return;
        }
        // Attributes are a comma separated list
        var attributes = oneExtendTable.getValue("attributes").split(",");
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].indexOf("update_synch") == 0) {
                attributes[i] = "update_synch=false";
                oneExtendTable.setValue("attributes", attributes.join(","));
                oneExtendTable.update();
                break;
            }
        }
        // Find the table's update_synch attribute
        var updateSynchAttribute = new GlideRecord("sys_schema_attribute_m2m");
        updateSynchAttribute.addQuery("schema", oneExtendTable.getUniqueValue());
        // Update synch attribute sys_id is always the same
        updateSynchAttribute.addQuery("attribute", "eb8ce330eb321100d4360c505206feac");
        updateSynchAttribute.query();
        updateSynchAttribute.setValue("value", "false");
        if (updateSynchAttribute.next()) {
            updateSynchAttribute.update();
        } else {
            updateSynchAttribute.setValue("schema", oneExtendTable.getUniqueValue());
            updateSynchAttribute.setValue("attribute", "eb8ce330eb321100d4360c505206feac");
            updateSynchAttribute.insert();
        }
    }
}
