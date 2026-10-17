var sampleMap = new GCFSampleMap();
sampleMap.put('event_name', 'upgrade_preview_log_ui_action_mark_as_reviewed');
GCFCollector.recordUsageEvent('custom_metric', 'upgrade_preview', 'upgrade_preview_event', sampleMap);

action.setRedirectURL(current);
current.resolution = 'reviewed';
current.update();
