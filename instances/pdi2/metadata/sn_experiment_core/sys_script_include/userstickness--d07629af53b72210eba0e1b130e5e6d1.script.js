var UserStickness = Class.create();
UserStickness.prototype = {
    initialize: function(salt) {
		this._salt = salt;
    },
	
	getPercentage : function(){
		var userID = gs.getUserID();
		var hash = new FnvHashGenerator().hash(userID + this._salt);
		return Number(hash % 1000000n)/1000000.0;
	},

    type: 'UserStickness'
};
