var sampleMap = new GCFSampleMap();
sampleMap.put('event_name', 'upgrade_preview_log_ui_action_retain_customization');
GCFCollector.recordUsageEvent('custom_metric', 'upgrade_preview', 'upgrade_preview_event', sampleMap);

action.setRedirectURL(current);
new PreviewRevertUpdateVersionAjax().retainCustomizationPreview(current.sys_id);
