(function executeRule(current, previous /*null when async*/ ) {
    if (sn_app_analytics.SNAnalytics.isEnabled()) {
        var channel = current.analytics_channel.name;
        var applicationSysId = current.bucket_document_id;
        var customerOverride = current.bucket_metadata_customer_override;
		current.bucket_metadata = sn_app_analytics.SNAnalytics.calculateUxaConfig(channel, applicationSysId, customerOverride);
    }

})(current, previous);
