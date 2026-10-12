var PluginUpgrader = Class.create();

PluginUpgrader.prototype = {

	/***
	 * Installs or repairs the plugin and a customization if requested
	 */
	upgrade: /*boolean*/ function(/*String*/ pluginId, /*String*/ customizationVersion, /*String*/ progressName, /*String*/ loadDemoData, /*String*/ loadDemoDataOnly, /*boolean*/ useQueue) {

		gs.info("PluginUpgrader.upgrade(): pluginId={0}, customizationVersion={1}, progressName={2}, loadDemoData={3}, loadDemoDataOnly={4}", pluginId, customizationVersion, progressName, loadDemoData,loadDemoDataOnly);
		gs.debug("useQueue=" + useQueue);
		
		var worker = new GlidePluginManagerWorker();

		worker.setProgressName(progressName);
		worker.setPluginId(pluginId);
		worker.setBackground(false);

		if (JSUtil.notNil(customizationVersion))
			worker.setCustomizationVersion(customizationVersion);

		if (typeof loadDemoDataOnly != "undefined" && loadDemoDataOnly == "true")
			worker.setLoadDemoDataOnly(true);

		if (typeof loadDemoData != "undefined" && loadDemoData == "true")
			worker.setIncludeDemoData(true);

		if (typeof useQueue != "undefined" && useQueue == true)
			worker.setWorkerFromQueue(true);

		worker.start();

		gs.info("PluginUpgrader.upgrade(): getProgressID = " + worker.getProgressID());

		return worker.getProgressID();
	}
};
