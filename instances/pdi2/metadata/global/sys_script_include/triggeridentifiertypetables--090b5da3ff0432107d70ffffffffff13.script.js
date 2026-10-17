var TriggerIdentifierTypeTables = Class.create();
TriggerIdentifierTypeTables.prototype = {
    initialize: function() {
    },

	process: function() {
		var tableNames = ['sys_hub_flow', 'syb_hub_action_type_definition'];
		return tableNames;
	},

    type: 'TriggerIdentifierTypeTables'
};
