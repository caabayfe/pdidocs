function transform(input) {
    var policyManager = new sn_vsc.SecurityPoliciesManager();
    var resultData = input.action_attributes || {};
    var checkboxData = input.checkbox_value || {};
    var id = input && input.sys_id;
    var removedConditionsIds = input.removed_conditions_ids || [];
    var removedNotificationsIds = input.removed_notifications_ids || [];
    var condition_logic = input.condition_logic || "";
    var selectedConditionWithoutValues = input.selected_condition_ids || [];
    var policyConditionTableName = "sn_vsc_security_policy_condition";

    for (var modelIdObj in resultData) {
        var modelId = modelIdObj.split(",")[0];
        var resultObj = resultData[modelId];
        modelId = modelId.split("_")[0];
        if (selectedConditionWithoutValues.indexOf(modelId) >= 0) {
            // If found, this is incorrect. Values are set, so remove from no values list
            selectedConditionWithoutValues.splice(selectedConditionWithoutValues.indexOf(modelId), 1);
        }
        // get the table we're updating, which is in each entry within resultObj
        var keys = Object.keys(resultObj);
        if (!keys || !keys[0] || !resultObj[keys[0]]['tableToUpdate']) {
            continue;
        }
        var tableToUpdate = resultObj[keys[0]]['tableToUpdate'];
        var actionID = resultObj["policy_action_sys_id"];
        var gr = new GlideRecord(tableToUpdate);
        // Get the record or initialize a new one
        if (tableToUpdate == policyConditionTableName) {
            gr.addQuery('policy', id);
            gr.addQuery('action_type', modelId);
            gr.query();
            if (!gr.next()) {
                gr.initialize();
                gr.setValue('policy', id);
                gr.setValue('action_type', modelId);
            }
        } else {
            if (actionID) {
                gr.get(actionID);
            } else {
                gr.initialize();
                gr.setValue('policy', id);
                gr.setValue('action_type', modelId);
            }
        }
        // Set the fields, but only if checkbox is unset or false
        if (!checkboxData[modelId]) {
            // Iterate over every action_attribute field
            for (var k = 0; k < keys.length; k++) {
                var key = keys[k];
                if (!resultObj[key] || resultObj[key].value == undefined) {
                    continue;
                }
                // Each action_attribute field could be made of several values
                // These values should be stored as a single comma separated string
                var values = resultObj[key].value;
                var finalVal = "";
                for (var i = 0; i < values.length; i++) {
                    if (i != 0) {
                        finalVal += ',';
                    }
                    finalVal += values[i].id;
                }
                gr.action_attributes[key.toString()] = finalVal.toString();
            }
        } else {
            // This checkbox has been taken care of, so remove it so a blank condition isn't added in
            delete checkboxData[modelId];
        }

        gr.update();
    }

    for (var i = 0; i < selectedConditionWithoutValues.length; i++) {
        checkboxData[selectedConditionWithoutValues[i]] = true;
    }

    for (var modelIdVal in checkboxData) {
        if (checkboxData[modelIdVal] == true) {
            var gr = new GlideRecord(policyConditionTableName);
            gr.addQuery('policy', id);
            gr.addQuery('action_type', modelIdVal);
            gr.query();
            if (gr.next()) {
                var fields = Object.keys(gr.action_attributes);
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (field != 'sys_id' && field != 'sys_meta') {
                        gr.action_attributes[field] = '';
                    }
                }
            } else {
                gr = new GlideRecord(policyConditionTableName);
                gr.setValue('policy', id);
                gr.setValue('action_type', modelIdVal);
            }
            gr.update();
        }
    }

    if (removedConditionsIds && removedConditionsIds.length) {
        // Delete conditions for the policy when removed button is clicked
        for (var i = 0; i < removedConditionsIds.length; i++) {
            var removeConditionsGr = new GlideRecord('sn_vsc_security_policy_condition');
            removeConditionsGr.addQuery("action_type", removedConditionsIds[i]);
            removeConditionsGr.addQuery("policy", id);
            removeConditionsGr.query();
            if (removeConditionsGr.next()) {
                removeConditionsGr.deleteRecord();
            }
        }
    }

    if (removedNotificationsIds && removedNotificationsIds.length) {
        // Delete notifications for the policy when removed button is clicked
        for (var j = 0; j < removedNotificationsIds.length; j++) {
            var removeNotificationGr = new GlideRecord('sn_vsc_security_policy_action');
            removeNotificationGr.addQuery("sys_id", removedNotificationsIds[j]);
            removeNotificationGr.query();
            if (removeNotificationGr.next()) {
                removeNotificationGr.deleteRecord();
            }
        }
    }

    if (condition_logic) {
        var gr = new GlideRecord("sn_vsc_security_policy");
        if (gr.get(id)) {
            gr.setValue("events_criteria_type", condition_logic);
            gr.update();
        }
    }

    policyManager.updatePolicyConfigureValue(id);
}
