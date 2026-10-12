makeUpdateSyncFalse();

function makeUpdateSyncFalse() {
    var dbObjGr = new GlideRecord("sys_db_object");
    dbObjGr.addQuery("name=sys_cs_typing_indicator^super_classISNOTEMPTY");
    dbObjGr.query();
    //if the table schema is extending sys_metadata table
    if (dbObjGr.next()) {
        // Find the table's sys_id
        var typingIndicatorTable = new GlideRecord("sys_dictionary");
        typingIndicatorTable.addQuery("name", "sys_cs_typing_indicator");
        typingIndicatorTable.addQuery("element", "");
        typingIndicatorTable.query();
        if (!typingIndicatorTable.next() || typingIndicatorTable.hasNext()) {
            gs.warn('Searching for a single sys_cs_typing_indicator record in the ' +
                'sys_dictionary table failed. Not modifying update_sync attribute');
            return;
        }
        // Attributes are a comma separated list
        var attributes = typingIndicatorTable.getValue("attributes").split(",");
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].indexOf("update_synch") == 0) {
                attributes[i] = "update_synch=false";
                typingIndicatorTable.setValue("attributes", attributes.join(","));
                typingIndicatorTable.setWorkflow(false);
                typingIndicatorTable.update();
                break;
            }
        }
        // Find the table's update_synch attribute
        var updateSynchAttribute = new GlideRecord("sys_schema_attribute_m2m");
        updateSynchAttribute.addQuery("schema", typingIndicatorTable.getUniqueValue());
        // Update synch attribute sys_id is always the same
        updateSynchAttribute.addQuery("attribute", "eb8ce330eb321100d4360c505206feac");
        updateSynchAttribute.query();
        if (updateSynchAttribute.next()) {
            updateSynchAttribute.setValue("value", "false");
            updateSynchAttribute.setWorkflow(false);
            updateSynchAttribute.update();
        } else {
            updateSynchAttribute = new GlideRecord("sys_schema_attribute_m2m");
            updateSynchAttribute.setValue("schema", typingIndicatorTable.getUniqueValue());
            updateSynchAttribute.setValue("attribute", "eb8ce330eb321100d4360c505206feac");
            updateSynchAttribute.setValue("value", "false");
            updateSynchAttribute.setWorkflow(false);
            updateSynchAttribute.insert();
        }
    }
}
