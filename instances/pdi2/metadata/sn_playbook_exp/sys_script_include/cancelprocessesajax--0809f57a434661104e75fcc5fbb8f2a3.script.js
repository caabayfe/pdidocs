var CancelProcessesAjax = Class.create();
CancelProcessesAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    cancelProcessess: function() {
        var selectedSysIds = this.getParameter('sysparm_selectedProcesses').split(',');
        var reason = this.getParameter('sysparm_reason');
        selectedSysIds.forEach(function cancelProcess(sysID) {
			var process = new GlideRecord('sys_pd_context');
			process.get(sysID);
			var parent = new GlideRecord(process.getValue("input_table"));
			var cancellableState = process.getValue('state') === 'QUEUED' || process.getValue('state') === 'IN_PROGRESS';
			if (cancellableState && (gs.hasRole('pd_cancel') || parent.get(process.getValue("input_record")) && parent.canWrite())) {
				sn_playbook.PlaybookExperience.cancelPlaybook(process, reason);
			}
        });
    },

    type: 'CancelProcessesAjax'
});
