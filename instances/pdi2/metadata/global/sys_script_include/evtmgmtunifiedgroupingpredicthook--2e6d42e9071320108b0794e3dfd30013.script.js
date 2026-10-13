var EvtMgmtUnifiedGroupingPredictHook = Class.create();
EvtMgmtUnifiedGroupingPredictHook.prototype = {
    initialize: function() {
    },
	
	//Implement predict cluster/patterns for given list of alert ids
	//Result: alert - cluster/pattern map
	//Example: 
	//{'f18b9ae673111300f1459361e5f6a7e3': 'cluster1', '3018dc7473111300f1459361e5f6a72c': 'cluster2'}
	predict: function(sysIds) {
        var result = {};
		var alertIds = sysIds.split(','); // split of empty string results in an array with empty string of length 1 ['']
		//put here the logic of pattern prediction
        var myJSON = JSON.stringify(result);
        return myJSON;
	},
    type: 'EvtMgmtUnifiedGroupingPredictHook'
};
