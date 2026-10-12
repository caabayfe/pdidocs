var converter = new EmailNotificationConverter();
converter.convertNotificationToVersion2(current);
try {
    var sm = new GCFSampleMap();
    sm.put('dummy_key', '0');
    GCFCollector.recordUsageEvent('notifications', 'html_editor', 'switched_from_v1_v2', sm);
} catch (error) {
    gs.warn('Exception occur for GCF event: ' + 'switched_from_v1_v2');
}
if (! current.isActionAborted())
    action.setRedirectURL(current);
