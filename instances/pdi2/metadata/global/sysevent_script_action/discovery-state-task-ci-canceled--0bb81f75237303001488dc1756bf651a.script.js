updateStatus();

function updateStatus() {
	var discoveryScript = new ChangeRequestDiscovery();
	
	var taskCI = new GlideRecord('task_ci');
	taskCI.addQuery('discovery', event.instance);
	taskCI.query();
	if (taskCI.next()) {
		taskCI.setValue('discovery_result', discoveryScript.DISCO_CANCEL);
		taskCI.setValue('discovery_log_url', discoveryScript.generateDiscoveryStatusLink(event.instance));
		taskCI.update();
		return;
	}
	
	if (GlidePluginManager.isActive(discoveryScript.PLUGIN_SVC_MAPPING)) {
		var taskService = new GlideRecord('task_cmdb_ci_service');
		taskService.addQuery('discovery', event.instance);
		taskService.query();
		while (taskService.next()) {
			taskService.setValue('discovery_result', discoveryScript.DISCO_CANCEL);
			taskService.setValue('discovery_log_url', discoveryScript.generateDiscoveryStatusLink(event.instance));
			taskService.update();
		}
	}
}
