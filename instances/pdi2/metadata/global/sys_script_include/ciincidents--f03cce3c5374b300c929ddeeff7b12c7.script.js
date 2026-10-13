var CIIncidents = Class.create();
var res = "";
CIIncidents.prototype = {
    initialize: function(input) {
		var parent = new GlideRecord("em_alert");
		parent.addQuery("number", input);
		parent.query();
		if(parent.next()) {
			var current = new GlideRecord("incident");
			var emAiInsight = new EmAiInsight();
			emAiInsight.getSameCiTaskQuery(current, parent);
			res = current.getEncodedQuery();
		} else {
			gs.log("******* No Record was found for alert number =" + input + "*****");
		}
    },
	get: function () {
    		return res;	
	},
    type: 'CIIncidents'
};
