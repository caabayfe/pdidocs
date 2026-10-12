var ExcludeCIsFromCMDBTask = Class.create();
ExcludeCIsFromCMDBTask.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    addCIstoExclusionList: function() {
        if (!gs.hasRole('cmdb_read')) {
            return;
        }
        var task_id = this.getParameter('sysparm_task_sys_id');
        var selected_cis = this.getParameter('sysparm_selected_cis');
        var cis = selected_cis.split(',');
        for (var i = 0; i < cis.length; i++) {
            var ci = cis[i];
            var gr = new GlideRecord('cmdb_policy_ci_exclusion_list');
            gr.initialize();
            var grCI = new GlideRecord('cmdb_data_management_task_to_ci');
            grCI.addQuery('sys_id', ci);
            grCI.query();
            if (grCI.next()) {
                gr.setValue('ci', grCI.ci);
            } else {
                return;
            }
            var grTask = new GlideRecord('cmdb_data_management_task');
            grTask.addQuery('sys_id', task_id);
            grTask.query();
            if (grTask.next()) {
                gr.setValue('policy_type', grTask.policy_id.cmdb_policy_type);
                gr.insert();
            } else {
                return;
            }
        }
        var taskToCIgr = new GlideRecord('cmdb_data_management_task_to_ci');
        taskToCIgr.addQuery('sys_id', 'IN', selected_cis);
        taskToCIgr.query();
        taskToCIgr.deleteMultiple();
    },

    toString: function() {
        return 'ExcludeCIsFromCMDBTask';
    }
});
