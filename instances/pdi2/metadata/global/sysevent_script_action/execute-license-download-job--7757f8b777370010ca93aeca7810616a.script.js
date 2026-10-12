downloadLicense();

function downloadLicense() {
    gs.log("Perform any post upgrade tasks after receiving system.upgraded event", "Execute Post upgrade Job");
    //1. group conversion if needed
    //2. Download licenses
    SNC.UsageAnalyticsScriptUtils.handlePostUpgradeActivities();
}
