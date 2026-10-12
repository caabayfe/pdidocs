(function executeRule(current, previous /*null when async*/ ) {
    var operation = current.operation();
    var bucketGR = new GlideRecord('sys_analytics_bucket');
    if (operation == "insert") {
        bucketGR.initialize();
        bucketGR.application_name = current.application_name;
        bucketGR.enabled = current.active;
        bucketGR.analytics_channel = current.analytics_channel;
        bucketGR.bucket_document_id = current.app_sys_id;
        bucketGR.bucket_table_name = current.table_name;
        bucketGR.enable_unauthenticated_user_tracking = current.enable_unauthenticated_user_tracking;
        var documentGr = new GlideRecord(current.table_name);
        documentGr.get(current.app_sys_id);
        bucketGR.sys_scope = sn_app_analytics.SNAnalytics.getBucketScope(documentGr);
        bucketGR.setWorkflow(false);
        bucketGR.insert();
    } else if (operation == "update") {
        bucketGR.addQuery("bucket_document_id", current.app_sys_id);
        bucketGR.addQuery("analytics_channel", current.analytics_channel);
        bucketGR.addQuery("bucket_table_name", current.table_name);
        bucketGR.query();
        if (bucketGR.next()) {
            bucketGR.application_name = current.application_name;
            bucketGR.enabled = current.active;
            bucketGR.enable_unauthenticated_user_tracking = current.enable_unauthenticated_user_tracking;
            bucketGR.setWorkflow(false);
            bucketGR.update();
        }
    }
})(current, previous);
