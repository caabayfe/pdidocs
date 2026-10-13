/*
 * @typedef {Array<{
					 value: string,
					 label: string
			}>} PreferenceData
 */
var NotifySMSPreferences = Class.create();
NotifySMSPreferences.prototype = {
    initialize: function() {
    },

	PLUGIN_TWILIO_LEGACY_DRIVER: "com.snc.notify.twilio",

    /*
	 * @returns {ProviderData}
	 */
	getProviders: function() {
		var providerNames = new NotifyUtilSNC().getTelephonyProviders();
		var providers = [], prov;
		for (var i = 0; i < providerNames.length; i++) {
			prov = {};
			prov.value = prov.label = providerNames[i];
			providers.push(prov);
		}
		// For legacy Twilio driver, add an entry
		if (GlidePluginManager.isActive(this.PLUGIN_TWILIO_LEGACY_DRIVER)) {
			prov = {};
			prov.label = "Twilio (Legacy)";
			prov.value = "Twilio";
			providers.push(prov);
		}
		return providers;
	},

	type: 'NotifySMSPreferences'
};
