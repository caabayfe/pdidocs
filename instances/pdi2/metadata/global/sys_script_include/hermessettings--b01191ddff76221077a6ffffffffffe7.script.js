var HermesSettings = Class.create();
HermesSettings.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getSettings: function() {
        return (new sn_hermes.HermesSettingsUtil().getSettings());
    },
	saveSettings: function() {
		var settingsParam = this.getParameter('sysparm_settings');
		return (new sn_hermes.HermesSettingsUtil().setSettings(settingsParam));
	},
    type: 'HermesSettings'
});
