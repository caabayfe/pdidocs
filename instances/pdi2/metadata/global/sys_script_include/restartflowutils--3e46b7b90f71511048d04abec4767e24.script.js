var RestartFlowUtils = Class.create();

RestartFlowUtils.prototype = {
    initialize: function() {
    },
	checkBackground: function(attr){
		try {
			var a = JSON.parse(attr);
		
		} catch(e) {
			gs.addInfoMessage(e.message);
			return false;
		}
		
		return a.run_flow_in === 'background';
		
	},

    type: 'RestartFlowUtils'
};
