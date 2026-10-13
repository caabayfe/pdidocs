/*
 * @typedef {Array<{
					 value: string,
					 label: string
			}>} PreferenceData
 */
var SMSPreferences = Class.create();
SMSPreferences.prototype = {
    initialize: function() {
    },

    /*
	 * @returns {ProviderData}
	 */
	getProviders: function() {
		return [];
	},

    type: 'SMSPreferences'
};
