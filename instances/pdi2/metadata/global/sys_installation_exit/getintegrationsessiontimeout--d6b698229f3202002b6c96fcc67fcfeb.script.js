gs.include("PrototypeServer");

var GetIntegrationSessionTimeout = Class.create();
GetIntegrationSessionTimeout.prototype = {
	initialize : function() {
	},
	
	// Gets the timeout (in minutes) for the new session being established for the current transaction.
	// Either numbers or strings containing numbers can be returned.
	//
	// If this script returns:
	//  - Any positive number or a string that represents a positive number. It will be interpreted
	//     as the desired session timeout in minutes for the new session.
	//  - Any non-positive number, or string that doesn't represent a number. It will be interpreted
	//     that the script does not wish to alter the default session timeout behavior.
	
	process : function() {
		// request and response are passed in as globals
		return this.getIntegrationSessionTimeout();
	},
	
	// override integration session timeout for the current transaction
	getIntegrationSessionTimeout : function() {
		return GlideProperties.get('glide.integration.session_timeout', '1');
	}
};
