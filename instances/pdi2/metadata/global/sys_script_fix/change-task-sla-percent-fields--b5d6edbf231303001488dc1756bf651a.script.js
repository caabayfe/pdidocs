if (!pm.isZboot()) {
	var dictionaryGR = new GlideRecord('sys_dictionary');
	dictionaryGR.addQuery('name', 'task_sla');
	dictionaryGR.addQuery('element', 'IN', 'percentage,business_percentage');
	dictionaryGR.query();
	var dictionaryMod = sn_collision.CollisionAPI.atLeastOneWillNotBeReplacedOnUpgrade(dictionaryGR);

	var styleGR = new GlideRecord('sys_ui_style');
	styleGR.addQuery('name', 'task_sla');
	styleGR.addQuery('element', 'IN', 'business_percentage,percentage,stage');
	styleGR.query();
	var styleMod = sn_collision.CollisionAPI.atLeastOneWillNotBeReplacedOnUpgrade(styleGR);

	if (!dictionaryMod && !styleMod) {
		// Update percentage fields to percent_complete if not edited
		dictionaryGR.query();
		while (dictionaryGR.next()) {
			dictionaryGR.setValue('internal_type','percent_complete');
			dictionaryGR.setValue('attributes', 'target_threshold_colors=0:#71e279;50:#fcc742;75:#fc8a3d;100:#f95050');
			dictionaryGR.update();
		}

		// Remove field styles
		var um = new GlideUpdateManager2();
		um.load("com.snc.sla", "delete_styles");
	}
}
