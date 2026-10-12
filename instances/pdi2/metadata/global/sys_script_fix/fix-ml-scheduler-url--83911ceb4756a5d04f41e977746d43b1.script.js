setSchedulerURL();

function setSchedulerURL() {
    if (gs.getProperty("glide.shared_service_scheduler.url") != null && gs.getProperty("glide.shared_service_scheduler.url") != "null" && gs.getProperty("glide.shared_service_scheduler.url") != '') {
        var value = gs.getProperty("glide.shared_service_scheduler.url");
        gs.setProperty("glide.shared_service_scheduler.url", "");
        gs.setProperty("glide.shared_service_scheduler.url", value);
    } else {
        if (pm.isActive("com.glide.platform_ml") && !GlideUtil.isDeveloperInstance()) {
            gs.setProperty("glide.shared_service_scheduler.url", "https://sncmlscheduler.service-now.com/");
            gs.log("Setting scheduler URL to default ML scheduler");
        } else {
            gs.log("Scheduler URL was not set. Is developer instance?: " + GlideUtil.isDeveloperInstance());
        }
    }
}
