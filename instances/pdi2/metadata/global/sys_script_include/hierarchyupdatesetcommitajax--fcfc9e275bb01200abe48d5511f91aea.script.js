var HierarchyUpdateSetCommitAjax = Class.create();

HierarchyUpdateSetCommitAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		var sysId = this.getParameter("sysparm_ajax_processor_sys_id");
		var func = this.getParameter("sysparm_ajax_processor_function");
		var skipAppInstalls = this.getParameter("sysparm_ajax_processor_skip_app_installs");
		
		if (func == "commit")
			return this.commitRemoteBaseUpdateSet(sysId, skipAppInstalls);
		if (func == "cancel")
			return this.cancelHierarchyCommit();
	},
	
	commitRemoteBaseUpdateSet: function(sysId, skipAppInstalls) {
		var gr = new GlideRecord('sys_remote_update_set');
		if (!gr.get(sysId) || !gr.canWrite()) {
			gs.print("An attempt to commit remote batch update set with insufficient rights was blocked");
			return;
		}
		
		var starter = new SNC.HierarchyUpdateSetScriptable();
		return starter.commitHierarchyWithSkipAppInstalls(gr.sys_id, skipAppInstalls);
	},
	
	cancelHierarchyCommit: function() {
		var workerId = this.getParameter("sysparm_worker_id");
		
		//Load the remote update set and create a local update set from it.
		var tracker = SNC.GlideExecutionTracker.getBySysID(workerId);		
		tracker.cancel(gs.getMessage("Cancelled update set"));
		
		var updateSetId = tracker.getSource();
		var gr = GlideRecord("sys_remote_update_set");
		if (!gr.get(updateSetId))
			return;

		gr.state = "partial"; // Partial Commit state
		gr.update();
	},
	
	type: "HierarchyUpdateSetCommitAjax"
	
});
