var JWTTokenInternal = Class.create();
JWTTokenInternal.prototype = {
    initialize: function(jwtproviderID) {
		this.jwtProviderID = jwtproviderID;
    },

	isAllowedToGenerateJWT: function() {
		return gs.isLoggedIn();
	},
	
    type: 'JWTTokenInternal'
};
