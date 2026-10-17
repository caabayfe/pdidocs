// checks the upgrade server for latest version of installed apps

var updateChecker = new UpdateChecker();
updateChecker.updateClientCallsPropertyFromAppRepo();
if (gs.getProperty("sn_appclient.client_calls_allowed", "true") == "true") {
    updateChecker.checkAvailableUpdates(false, false, {"forceUpdate": true});
    // install any auto upgrades
    new AppUpgrader().autoUpdates();
}
