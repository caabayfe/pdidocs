var RoleChecker = Class.create();
RoleChecker.prototype = {
    initialize: function() {
    },
	
	isFunctionFieldAdmin: function() {
        if (gs.hasRole('admin'))
            return false;
		
        if (gs.hasRole('function_field_admin'))
            return true;
		
        return false;
    },

    type: 'RoleChecker'
};
