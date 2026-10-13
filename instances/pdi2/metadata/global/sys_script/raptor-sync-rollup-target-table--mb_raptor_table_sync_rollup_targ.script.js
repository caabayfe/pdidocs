(function executeRule(current, previous) {
	var rollupSpecId = current.getValue('mb_raptor_rollup_spec');
	var targetTable = current.getValue('target_table');

	if (rollupSpecId) {
		var gr = new GlideRecord('mb_raptor_rollup_spec');
		if (gr.get(rollupSpecId)) {
			gr.setValue('rollup_target_table', targetTable);
			gr.update();
		}
	}

	// Clear the old rollup spec's target table if it changed
	if (previous && previous.mb_raptor_rollup_spec) {
		var oldRollupSpecId = previous.getValue('mb_raptor_rollup_spec');
		if (oldRollupSpecId && oldRollupSpecId !== rollupSpecId) {
			var oldGr = new GlideRecord('mb_raptor_rollup_spec');
			if (oldGr.get(oldRollupSpecId)) {
				oldGr.setValue('rollup_target_table', '');
				oldGr.update();
			}
		}
	}
})(current, previous);
