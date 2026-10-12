var SetAppCustomizationVersion = Class.create();
SetAppCustomizationVersion.prototype = {
    initialize: function() {
    },
	
	setVersion: function(appId, version) {
		appRecord = new GlideRecord('sys_app_customization');

        if (appRecord.get(appId)) {
            appRecord.setValue('version', version);
            appRecord.update();
        }
	},

    type: 'SetAppCustomizationVersion'
};
