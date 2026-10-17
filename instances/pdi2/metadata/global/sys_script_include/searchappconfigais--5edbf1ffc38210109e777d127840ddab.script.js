var SearchAppConfigAIS = Class.create();
SearchAppConfigAIS.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	type: 'SearchAppConfigAIS',
	
	getReadiness: function() {
		var isReady  = new sn_ais.StatusApi().isAisEnabled();
		return isReady.toString();
	}
    
});
