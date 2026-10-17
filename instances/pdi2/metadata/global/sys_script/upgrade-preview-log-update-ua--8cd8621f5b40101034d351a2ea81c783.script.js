(function executeRule(current, previous /*null when async*/) {
	var sampleMap = new GCFSampleMap();
	sampleMap.put('event_name', 'upgrade_preview_log_ui_action_update');
	GCFCollector.recordUsageEvent('custom_metric', 'upgrade_preview', 'upgrade_preview_event', sampleMap);
})(current, previous);
