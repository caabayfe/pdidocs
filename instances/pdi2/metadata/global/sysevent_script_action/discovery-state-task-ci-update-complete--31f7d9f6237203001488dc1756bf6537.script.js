updateStatus();

function updateStatus() {
	var discoveryScript = new ChangeRequestDiscovery();
	
	var taskCI = new GlideRecord('task_ci');
	taskCI.addQuery('discovery', event.instance);
	taskCI.query();
	if (taskCI.next()) {
		discoveryScript.updateDiscoveryState(taskCI.getUniqueValue(), event.instance, false);
		return;
	}

	if (GlidePluginManager.isActive(discoveryScript.PLUGIN_SVC_MAPPING)) {
		var taskService = new GlideRecord('task_cmdb_ci_service');
		taskService.addQuery('discovery', event.instance);
		taskService.query();
		while (taskService.next())
			discoveryScript.updateDiscoveryState(taskService.getUniqueValue(), event.instance, true);
	}
}
