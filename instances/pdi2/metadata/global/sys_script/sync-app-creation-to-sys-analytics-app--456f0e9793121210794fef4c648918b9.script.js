(function executeRule(current, previous /*null when async*/) {
	try {
        if (
            current.bucket_table_name !== 'sys_ux_metrics_app' ||
            (current.bucket_table_name === 'sys_ux_metrics_app' && !['CoreUI Analytics', 'Next Experience Analytics'].includes(current.application_name))
        ) {
            sn_app_analytics.SNAnalytics.syncAppCreation(current.bucket_table_name, current.bucket_document_id, current.getDisplayValue('analytics_channel'));
        }
    } catch (err) {
        gs.log("Error Syncing app creation records on sys_analytics_app: " + err);
    }
})(current, previous);
