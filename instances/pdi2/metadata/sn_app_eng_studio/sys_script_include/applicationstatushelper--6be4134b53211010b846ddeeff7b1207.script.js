var ApplicationStatusHelper = Class.create();
ApplicationStatusHelper.prototype = {
    initialize: function() {
    },
	// keys in this mapping correlate to the value of `state` in task table
	appStatusMapping: {
		0: { value: 'in_development', display_value: gs.getMessage('In Development')},
		1: { value: 'pending_approval', display_value: gs.getMessage('Pending Approval')},
		2: { value: 'in_validation', display_value: gs.getMessage('In Validation')},
		3: { value: 'published', display_value: gs.getMessage('Published')},
		4: { value: 'rejected', display_value: gs.getMessage('Rejected')},
	},
    type: 'ApplicationStatusHelper'
};
