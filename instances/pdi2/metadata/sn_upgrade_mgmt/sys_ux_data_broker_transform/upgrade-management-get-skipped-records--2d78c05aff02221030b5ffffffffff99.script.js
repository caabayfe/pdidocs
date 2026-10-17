function transform(input) {
    var offset = input.offset;
    var limit = input.limit;
    var hid = String(input.upgrade_history_sys_id || '');

    try {
        // Original system-upgrade path — query upgrade_mgmt_skipped_record_owner first
        var result = [];
        if (hid) {
            var gr = new GlideRecord("upgrade_mgmt_skipped_record_owner");
            var query = "a_upgrade_history.sys_id=" + hid + "^a_dispositionIN4,5,104,105,9,10^a_changed=true^ORa_disposition=9^NQa_disposition=2^a_resolution_status=reviewed_reverted^a_changed=true^a_upgrade_history.sys_id=" + hid;
            gr.addQuery(query);
            gr.orderBy("a_resolution_status");
            gr.orderBy("a_file_name");
            gr.chooseWindow(offset, offset + limit);
            gr.query();

            var keys = ["a_sys_id", "b_sys_id", "a_file_name", "a_application_category", "a_resolution_status", "b_assigned_to", "a_disposition", "a_type_priority", "a_plugin"];
            while (gr.next()) {
                var temp = {};
                keys.forEach(function(el) {
                    temp[el] = {};
                    temp[el]["displayValue"] = gr.getDisplayValue(el);
                    temp[el]["value"] = gr.getValue(el);
                });
                var fileName = gr.getDisplayValue("a_file_name");
                var countGr = new GlideAggregate("sys_traced_metadata");
                countGr.addAggregate("COUNT");
                countGr.addQuery("sys_update_name", fileName);
                countGr.query();
                var totalCount = 0;
                if (countGr.next()) {
                    totalCount = parseInt(countGr.getAggregate("COUNT"), 10);
                }
                temp["test_count"] = totalCount;
                result.push(temp);
            }
            if (result.length > 0) return result;
        }

        // Bulk-update fallback: upgrade_mgmt_skipped_record_owner returned 0 rows
        // for the given upgrade_history_sys_id. Delegate to the global helper
        // which can read sys_upgrade_history_log past the cross-scope policy.
        // Only runs when hid is explicitly provided — never falls back to an
        // active bulk session, to avoid cross-contamination with system-upgrade
        // screens on instances that have both flows.
        if (hid) {
            try {
                return new global.UpgradeManagementApiUtil().getBulkSkippedRecordsList(hid, offset, limit);
            } catch (e) {
                gs.error('getBulkSkippedRecordsList failed: ' + e);
            }
        }
        return [];
    } catch (error) {
        gs.info("Error in executing data broker Upgrade Management - Get Skipped Records" + error);
        return [];
    }
}
