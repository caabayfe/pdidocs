var CloseChatWindowUtils = Class.create();
CloseChatWindowUtils.prototype = {
    initialize: function() {
    },
	
	getReferer: function() {
		var txn = GlideTransaction.get(); 
		if (!txn)
            return;
        var request = txn.getRequest();
        if (!request)
            return;
        var referer = request.getHeader("Referer");
		return referer;
	},

    type: 'CloseChatWindowUtils'
};
