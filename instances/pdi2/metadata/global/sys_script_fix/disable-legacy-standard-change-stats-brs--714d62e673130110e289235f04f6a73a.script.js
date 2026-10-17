(function() {
	if (pm.isZboot())
		return;

	/* Business rules:
	
		Update Standard Change Version stats
		Update Standard Version stats on delete
	*/
	var legacyStandardChangeStatsBRs = ["ef150739ff010200b18affffffffff04", "98937c609ff22200b18a7feea57fcf85"];

	var businessRuleGr = new GlideRecord("sys_script");
	businessRuleGr.addActiveQuery();
	businessRuleGr.addQuery("sys_id", legacyStandardChangeStatsBRs);
	businessRuleGr.query();

	while (businessRuleGr.next()) {
		if (sn_collision.CollisionAPI.willBeReplacedOnUpgrade(businessRuleGr)) {
			businessRuleGr.setValue("active", false);
			businessRuleGr.update();
		}
	}
})();
