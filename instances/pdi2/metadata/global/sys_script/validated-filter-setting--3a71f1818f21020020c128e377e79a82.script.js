(function executeRule(current, previous /*undefined when async or display*/) {
	var scheduledExportsRecords = new GlideRecord('scheduled_data_export');
	scheduledExportsRecords.addQuery('enable_delta_export',true);
	scheduledExportsRecords.addQuery('export_set.export_definition', current.sys_id);
	scheduledExportsRecords.query();
	while(scheduledExportsRecords.next()) {
		var filter = current.filter;
		if(filter.indexOf(scheduledExportsRecords.getValue('delta_on_or_after')) > -1) {
			var msgArray = [];
			msgArray.push(scheduledExportsRecords.getValue('name'));
			msgArray.push(scheduledExportsRecords.getValue('delta_on_or_after'));
			var msg = gs.getMessage("Export definition configured with conflicting query. A conflicting delta query exists on the Scheduled Export '{0}'. Filter condition includes: {1}.", msgArray);
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
		}
	}
})(current, typeof previous != 'undefined' ?  previous : null);
