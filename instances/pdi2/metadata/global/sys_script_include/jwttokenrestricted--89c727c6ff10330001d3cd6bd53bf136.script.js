var JWTTokenRestricted = Class.create();
JWTTokenRestricted.prototype = Object.extend(new JWTTokenInternal(), {
    initialize: function(jwtProviderID) {
		JWTTokenInternal.prototype.initialize.call(this,jwtProviderID);
    },
	
	isAllowedToGenerateJWT: function() {
		if (!gs.isLoggedIn())
			return false;

		if ('system' == gs.getSession().getUserName())
			return true;

		var allowed = gs.hasRole('oauth_admin');
		return allowed;	
	},

	type: 'JWTTokenRestricted'
});
