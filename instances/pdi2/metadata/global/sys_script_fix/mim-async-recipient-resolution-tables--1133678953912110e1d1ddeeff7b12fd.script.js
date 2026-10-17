var mimAsyncResolutionTables = "incident_alert_task";
var emailClientAsyncResolutionProperty = "glide.email_client.async.resolution.tables";
var asyncResolutionTables = gs.getProperty(emailClientAsyncResolutionProperty);
if (asyncResolutionTables != null) {
    asyncResolutionTables += (asyncResolutionTables ? "," : "") + mimAsyncResolutionTables;
    gs.setProperty(emailClientAsyncResolutionProperty, asyncResolutionTables);
}
