var SimilarAlerts = Class.create();
var res = "";
SimilarAlerts.prototype = {
    initialize: function(input) {
		var parent = new GlideRecord("em_alert");
		parent.addQuery("number", input);
		parent.query();
		if(parent.next()) {
			var current = new GlideRecord("em_alert");
			var emAiInsight = new EmAiInsight();
			emAiInsight.getRelatedAlertQuery(current, parent);
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
