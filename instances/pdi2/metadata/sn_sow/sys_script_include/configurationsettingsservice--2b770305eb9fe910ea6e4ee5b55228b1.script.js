var ConfigurationSettingsService = Class.create();
ConfigurationSettingsService.prototype = Object.extendsObject(ConfigurationSettingsServiceSNC, {
	type: 'ConfigurationSettingsService',
	initialize: function() {
		ConfigurationSettingsServiceSNC.prototype.initialize.call(this);
    }
});
