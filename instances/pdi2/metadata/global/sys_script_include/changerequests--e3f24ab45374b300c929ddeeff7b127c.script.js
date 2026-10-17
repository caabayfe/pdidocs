var ChangeRequests = Class.create();
var res = "";
ChangeRequests.prototype = {
    initialize: function(input) {
		var parent = new GlideRecord("em_alert");
		parent.addQuery("number", input);
		parent.query();
		if(parent.next()) {
			var current = new GlideRecord("change_request");
			var emAiInsight = new EmAiInsight();
			emAiInsight.getSameCiTaskQuery(current, parent);
			res = current.getEncodedQuery();
		} else {
			gs.log("******* No Record was found for alert number =" + input + "*****");
		}
    },
 	get: function() {
		return res;
    },
    type: 'SimilarAlerts'
};
