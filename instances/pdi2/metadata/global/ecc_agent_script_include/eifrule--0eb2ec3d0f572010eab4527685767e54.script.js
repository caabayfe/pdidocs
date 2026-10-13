var EIFRule = Class.create();

EIFRule.prototype = Object.extendsObject(EIFRuleBase, {

	/*
	* Takes an EIF event as input and returns a ServiceNow event
	*/
	/* !! Override the run function from EIFRuleBase to customise processing
    run : function(eifEvent, extParam) {
		var event = new this.EVENT();
		
		return event;
    },
	*/

    type: "EIFRule"
});
