(function executeRule(current, previous /*null when async*/ ) {

    // sync enabled and enable_unauthenticated_user_tracking field to sys_analytics_app table 
    var appGR = new GlideRecord('sys_analytics_app');
    appGR.addQuery("app_sys_id", current.bucket_document_id);
    appGR.addQuery("analytics_channel", current.analytics_channel);
    appGR.addQuery("table_name", current.bucket_table_name);

    appGR.query();
    if (appGR.next()) {
        var shouldUpdate = false;
        if (appGR.active != current.enabled) {
            appGR.active = current.enabled;
            shouldUpdate = true;
        }

        if (appGR.enable_unauthenticated_user_tracking != current.enable_unauthenticated_user_tracking) {
            appGR.enable_unauthenticated_user_tracking = current.enable_unauthenticated_user_tracking;
            shouldUpdate = true;
        }

        if (shouldUpdate) {
            appGR.setWorkflow(false);
            appGR.update();
        }
    }
})(current, previous);
