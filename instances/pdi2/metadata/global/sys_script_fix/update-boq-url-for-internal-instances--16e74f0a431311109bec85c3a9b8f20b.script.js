var companyCode = gs.getProperty("glide.appcreator.company.code");
var disableBOQEndpointOverride = gs.getProperty("sn_atf_tg.disable_boq_endpoint_override") == "true";
if (companyCode == "snc" && !disableBOQEndpointOverride) {
    var gr = new GlideRecord("sys_service_endpoint");
    var serviceName = "ATFBrowserOrchestrationQueue";
    if (gr.isValid()) {
        gr.addQuery("name", serviceName);
        gr.query();
        if (gr.next()) {
            var nonCustomerBOQURL = "https://atf2-rel-boq";
            gr.url = nonCustomerBOQURL;
            gr.update();
            sn_internal_services.ServiceConfig.refreshInCluster(serviceName);
            gs.info("Updated BOQ endpoint for internal instance to: " + nonCustomerBOQURL);
        }
    }
}
