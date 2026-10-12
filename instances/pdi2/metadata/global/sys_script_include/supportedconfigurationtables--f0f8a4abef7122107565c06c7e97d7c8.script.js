var SupportedConfigurationTables = Class.create();
SupportedConfigurationTables.prototype = {
    initialize: function() {
    },
	process: function() {
		// list of data pattern tables in data privacy. 
		return ['dp_system_processor_configuration'];
	},
    type: 'SupportedConfigurationTables'
};
