var CMDBWsPolicyAssignmentType = Class.create();
CMDBWsPolicyAssignmentType.prototype = {
    initialize: function() {},
    process: function() {
		var validTables = ["sys_user","sys_user_group"];
		return validTables;
    },
    type: 'CMDBWsPolicyAssignmentType'
};
