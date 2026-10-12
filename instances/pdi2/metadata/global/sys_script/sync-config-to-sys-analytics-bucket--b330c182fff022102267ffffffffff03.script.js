(function executeRule(current, previous /*null when async*/ ) {

    var bucketGR = new GlideRecord('sys_analytics_bucket');
    bucketGR.addQuery("bucket_document_id", current.sys_analytics_app.app_sys_id.toString());
    bucketGR.query();
    if (bucketGR.next()) {
        var operation = current.operation();
        if (operation == "delete") {
            bucketGR.bucket_metadata = "";
            bucketGR.bucket_metadata_customer_override = "";
            bucketGR.setWorkflow(false);
            bucketGR.update();
        } else {
            bucketGR.bucket_metadata = current.configuration;
            bucketGR.bucket_metadata_customer_override = current.customer_override_configuration;
            bucketGR.setWorkflow(false);
            bucketGR.update();
        }
    }

})(current, previous);
