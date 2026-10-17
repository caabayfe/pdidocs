var grSourceApp = new GlideRecord('sys_error_appl');
		grSourceApp.get('plugin_id', 'com.snc.discovery');

		var discoveryStatusSysId = current.sys_id;
		var result = ErrorManager.aggregateInstanceCounts(grSourceApp.getUniqueValue(), discoveryStatusSysId);

		if (!result || !result.success)
			gs.error('Failed to aggregate error stats for Discovery Status ' + discoveryStatusSysId + ': ' + (result ? result.message : 'No response'));
