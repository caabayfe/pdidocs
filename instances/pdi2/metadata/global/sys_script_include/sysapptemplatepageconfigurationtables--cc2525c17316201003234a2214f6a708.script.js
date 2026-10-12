var SysAppTemplatePageConfigurationTables = Class.create();
SysAppTemplatePageConfigurationTables.prototype = {
    initialize: function() {
    },
	process: function() {
		// For now limit the user to select from spoke configurations.
		// add the tables which extend Template Page Configuration to this array.
		var configurationTables = ['sys_app_template_spoke_configuration'];
		return configurationTables;
	},

    type: 'SysAppTemplatePageConfigurationTables'
};
