gs.log("Upgrade: Started copying application data");
var analyticsBucket = new GlideRecord('sys_analytics_bucket');
analyticsBucket.addEncodedQuery('bucket_table_name!=sys_ux_metrics_app^NQbucket_table_name=sys_ux_metrics_app^application_nameINFlow Designer UI,Studio');
analyticsBucket.query();
var analyticsApp = new GlideRecord('sys_analytics_app');
var analyticsAppConfig = new GlideRecord('sys_analytics_app_config');
while(analyticsBucket.next()) {
    try {
      analyticsApp.initialize();
	  analyticsApp.setWorkflow(false);
      analyticsApp.app_sys_id = analyticsBucket.bucket_document_id;
      analyticsApp.application_name = analyticsBucket.application_name;
      analyticsApp.table_name = analyticsBucket.bucket_table_name;
      analyticsApp.analytics_channel = analyticsBucket.analytics_channel;
      analyticsApp.enable_unauthenticated_user_tracking = analyticsBucket.enable_unauthenticated_user_tracking;
      analyticsApp.active = analyticsBucket.enabled;
      var analyticsAppSysId = analyticsApp.insert();
      if (analyticsBucket.bucket_metadata) {
		analyticsAppConfig.initialize();
	  	analyticsAppConfig.setWorkflow(false);
      	analyticsAppConfig.sys_analytics_app = analyticsAppSysId;
        analyticsAppConfig.configuration = analyticsBucket.bucket_metadata;
		if (analyticsBucket.bucket_metadata_customer_override) {
			analyticsAppConfig.customer_override_configuration = analyticsBucket.bucket_metadata_customer_override;
		}
		analyticsAppConfig.insert();		
      }
    } catch(e) {
      gs.log("Upgrade: Error while copying data for the application: " +  analyticsBucket.application_name + " : " + e.message);
    }
}
gs.log("Upgrade: Completed copying application data");
