var SMv2_SubscriptionDetail_Consolidator = Class.create();
SMv2_SubscriptionDetail_Consolidator.prototype = {
    initialize: function() {
        this._sdDao = new sn_entitlement.SubscriptionDetailDao();
    },

    /**
     * consolidates the subscription_detail entries created by the migration process into a single entry per subscription per day
     */
    consolidate: function() {
        var gr = new GlideRecord("subscription_detail");
        gr.addNotNullQuery("migrated_state");
        gr.orderBy('subscription');
        gr.orderBy('calculated_on');
        gr.orderBy('sys_created_on');
        gr.query();
        var outputMap = {};

        while (gr.next()) {
            var subscription = gr.getValue("subscription");
            var calculated_on = gr.getValue("calculated_on");
            var calculated_on_date = calculated_on.split(' ')[0];
            var key = subscription + "_" + calculated_on_date;
            var targetObject = outputMap[key];
            if (!targetObject) {
                targetObject = {
                    migrated_state: null,
                    allocated_user_count: null,
                    available_user_count: null,
                    overallocated_user: null, //unique and not in subscription details
                    subscription: subscription,
                    calculated_on: calculated_on,
                    available_custom_table_count: null,
                    allocated_custom_table_count: null,
                    overallocated_quota: null, // unique and not in subscription details
                    license: gr.getValue("license"),
                    allocated_quota_count: null,
                    available_quota_count: null,
                    processing_complete: false,
                    is_latest: false
                };
                outputMap[key] = targetObject;
            }

            switch (gr.getValue("migrated_state")) {
                case "allocated":
                    var allocated = gr.getValue("allocated_user_count");
                    if (allocated != null)
                        targetObject['allocated_user_count'] = allocated;
                    else {
                        targetObject['allocated_quota_count'] = gr.getValue('allocated_quota_count');
                    }
                    break;
                case "over_allocated":
                    var over_allocated = gr.getValue("allocated_user_count");
                    if (over_allocated != null)
                        targetObject['overallocated_user'] = over_allocated;
                    else {
                        targetObject['overallocated_quota'] = gr.getValue('allocated_quota_count');
                    }
                    break;
                case "available":
                    var available = gr.getValue("available_user_count");
                    if (available != null)
                        targetObject['available_user_count'] = available;
                    else {
                        targetObject['available_quota_count'] = gr.getValue('available_quota_count');
                    }
                    break;
                case "tables_used":
                    var allocated_custom_table_count = gr.getValue('allocated_custom_table_count');
                    if (allocated_custom_table_count != null)
                        targetObject['allocated_custom_table_count'] = allocated_custom_table_count;
                    break;
                case "tables_available":
                    var available_custom_table_count = gr.getValue('available_custom_table_count');
                    if (available_custom_table_count != null)
                        targetObject['available_custom_table_count'] = available_custom_table_count;
                    break;
            }
        }
        //convert the objects
        for (var mapKey in outputMap) {
            if (outputMap.hasOwnProperty(mapKey)) {
                var value = outputMap[mapKey];
                if (value["overallocated_user"]) {
                    value["allocated_user_count"] = Number(value["allocated_user_count"]) + Number(value["overallocated_user"]);
                }
                if (value["overallocated_quota"]) {
                    value["allocated_quota_count"] = Number(value["allocated_quota_count"]) + Number(value["overallocated_quota"]);
                }
                delete value["overallocated_user"];
                delete value["overallocated_quota"];
            }
        }
        // writing output
        this._sdDao.migrateAllotmentHistory(Object.values(outputMap));
        //clear
        this._deleteOldMigrationData();
    },

    _deleteOldMigrationData: function(states_to_clear) {
        var gr = new GlideRecord("subscription_detail");
        gr.addNotNullQuery("migrated_state");
        if (states_to_clear)
            gr.addQuery('migrated_state', 'IN', states_to_clear);
        else
            gr.addQuery('migrated_state', 'IN', ['allocated', 'over_allocated', 'available', 'tables_used', 'tables_available']);
        gr.deleteMultiple();
    },

    type: 'SMv2_SubscriptionDetail_Consolidator'
};
