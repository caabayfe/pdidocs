var CMDBDataManagerTaskApprovalHelper = Class.create();
CMDBDataManagerTaskApprovalHelper.prototype = {
    initialize: function() {},

    triggerTaskApprovalSubFlow: function(taskRecord) {
        if (!gs.hasRole('data_manager_user')) {
            gs.error('Access denied: User does not have the required role to trigger CMDB Data Manager Task approval subflow.');
            return;
        }
        var msg = '';
        try {
            var subflow = '509b682c536320108cabddeeff7b12af';
            var subflowGr = new GlideRecord('sys_hub_flow');
            subflowGr.addQuery('sys_id', subflow);
            subflowGr.addQuery('active', true);
            subflowGr.query();
            if (!subflowGr.next()) {
                msg = 'Invalid task: Missing approval subflow record';
                gs.error(msg);
                // Update task to error
                handleFailure(msg);
                return;
            }
            // Grab subflow
            var subflowName = subflowGr.getValue('sys_scope') + '.' + subflowGr.getValue('internal_name');
            var inputs = {};
            inputs['task'] = taskRecord;
            var DEF_TIME_OUT = 1000 * 60 * 10;
            var TIME_OUT = gs.getProperty('glide.cmdb.data.manager.approval.subflow.timeout') || DEF_TIME_OUT;
            // Trigger approval workflow
            var res = sn_fd.FlowAPI.getRunner()
                .subflow(subflowName)
                .inBackground()
                .withInputs(inputs)
                .timeout(TIME_OUT)
                .run();
        } catch (ex) {
            var message = ex.message;
            gs.error(message);
            handleFailure(message);
        }

        function handleFailure(closeNotes) {
        	if (!gs.hasRole('data_manager_user')) {
                gs.error('Access denied: User does not have the required role to perform failure handling.');
                return;
            }
            taskRecord.setValue('state', 4); // Closed Incomplete
            taskRecord.setValue('close_notes', closeNotes);
            taskRecord.update();

            // Grab run as user
            var gr = new GlideRecord('cmdb_data_management_policy_runtime_attributes');
            gr.addQuery('policy', taskRecord.getValue('policy_id'));
            gr.query();

            if (!gr.next()) {
                gs.error(gs.getMessage('Could not find the runtime attribute record for the policy for this task.'));
            }

            var runAsUser = gr.getValue('run_as');
            // send notification
            var grUserRoles = new GlideRecord("sys_user_has_role");
            grUserRoles.addQuery("role", "b156309e53722010af64ddeeff7b1227"); // data_manager_admin role
            grUserRoles.query();
            var userList = [];

            if (runAsUser) {
                userList.push(runAsUser);
            }
            while (grUserRoles.next()) {
                userList.push(grUserRoles.user);
            }
            if (userList.length == 0) {
                gs.warn(gs.getMessage("The CMDB Data Manager policy: {0} does not have any users to send notification emails", taskRecord.policy_id));
                return;
            }
            gs.eventQueue("cmdbdatamanager.task.failed", taskRecord, userList.toString(), taskRecord.policy_id);
        }
    },

    type: 'CMDBDataManagerTaskApprovalHelper'
};
