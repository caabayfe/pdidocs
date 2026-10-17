var LocalPasswordActionHelper = Class.create();
LocalPasswordActionHelper.prototype = {
    initialize: function() {
    },
    authenticateUser: function(user_name,password) {
	var authed = user.authenticate(user_name,password);
	if (!authed) {
	    return false;
	}
	return true;
    },
    type: 'LocalPasswordActionHelper'
};
