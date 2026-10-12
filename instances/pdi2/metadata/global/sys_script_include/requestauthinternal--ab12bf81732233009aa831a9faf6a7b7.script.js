var RequestAuthInternal = Class.create();
RequestAuthInternal.prototype = {
	
    initialize: function() {
	},

	custom: function(authAPI) {
		
	},
	
	generateAuth: function(authAPI){
		this.custom(authAPI);
		return authAPI.generateAuth();
	},
	
    type: 'RequestAuthInternal'
};
