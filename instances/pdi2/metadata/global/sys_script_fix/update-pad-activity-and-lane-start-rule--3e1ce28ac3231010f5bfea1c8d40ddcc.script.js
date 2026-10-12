var laneRules = {
	after_previous : '3f030dc5bd8842aebc1fa64716545da2',
	with_condition : '77ebf7a3533110108b45ddeeff7b125a',
	with_previous : 'aed74dc26c714cb3a1d3ed263a04b3da',
	immediate : 'b823830967fc41ddb84959d97897b1ae'
};

var activityRules = {
		with_condition : '4d197b23533110108b45ddeeff7b129c',
		with_previous : '7c1ac084f80d4ed9be5a7b3df939463b',
		after_previous : 'eb98b4955ba74acab978af26ad083f61',
		immediate: 'ef8ab8c0a3f04bceb117263f51401070'
};

for (var laneRule in laneRules) {
	updateRule("sys_pd_lane", laneRule, laneRules[laneRule]);
}
for (var actRule in activityRules) {
	updateRule("sys_pd_activity", actRule, activityRules[actRule]);
}

function updateRule(table, rule, id) {
  var gr = new GlideRecord(table);
  gr.setWorkflow(false);
  gr.addQuery("start_rule", rule);
  gr.setValue("start_rule", id);
  gr.updateMultiple();
}
