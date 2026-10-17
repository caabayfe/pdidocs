(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (current.getValue("value") === "false") {
        //Flush cache
        GlideCacheManager.flush("PartnerUsageKeyCache");

        //Disable Scheduler
        var scheduledGR = new GlideRecord("sys_trigger");
        if (scheduledGR.get("4dcd7ccb530012108157ddeeff7b123c")) {
            scheduledGR.setValue("trigger_type", "2");
            scheduledGR.update();
        }

        //Empty Table
        var partnerKeysGR = new GlideRecord("ua_partner_connector_key");
        partnerKeysGR.deleteMultiple();

        //Set com.glide.enable_usage_key_sync_job to false
        var syspropGR = new GlideRecord("sys_properties");
        if (syspropGR.get("name","com.glide.enable_partner_usage_key_tracking_sync_job")) {
            syspropGR.setValue("value", "false");
            syspropGR.setWorkflow(false);
            syspropGR.update();
        }
    }

})(current, previous);
