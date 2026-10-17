var CMDBDuplicateRemediatorUtil = Class.create();
CMDBDuplicateRemediatorUtil.prototype = {
    initialize: function() {},

    getDuplicates: function(taskId, masterSysId) {
        var duplicates = [];
        if (gs.hasRole('sn_cmdb_editor') || gs.hasRole('cmdb_dedup_admin')) {
            var gr = new GlideRecord('duplicate_audit_result');
            gr.addQuery('follow_on_task', taskId);
            gr.addQuery('duplicate_ci', '!=', masterSysId);

            gr.query();
            while (gr.next()) {
                duplicates.push(gr.duplicate_ci.toString());
            }
        }

        return duplicates;
    },

    type: 'CMDBDuplicateRemediatorUtil'
};
