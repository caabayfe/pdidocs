var tableNames = ["ua_custom_table_inventory", "sys_scope"];
    var subscriptionField = "subscription_entitlement";
    var allotmentField = "allotment_type";
    for (var i = 0; i < tableNames.length; i++) {
        var gr = new GlideRecord(tableNames[i]);
        gr.addNotNullQuery(subscriptionField);
        gr.setValue(subscriptionField, "NULL");
        if (tableNames[i] == "ua_custom_table_inventory")
            gr.setValue(allotmentField, "NULL");
        gr.updateMultiple();
    }
