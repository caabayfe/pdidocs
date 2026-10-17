(function executeRule(current, previous) {
	try {
		if (current.active.toString() !== 'true') {
			return;
		}

		var similarRecordFound = false;
		var similarRecordInactive = false;
		var foundActive = false;

		var grHardwareMapping = new GlideRecord('alm_hardware_state_mapping');

		if (current.synch_direction.toString() === 'both') {
			// Check for single 'both' entry
			grHardwareMapping.addQuery('synch_direction', 'both');
			grHardwareMapping.addQuery('asset_state', current.asset_state);
			grHardwareMapping.addQuery('asset_substate', current.asset_substate);
			grHardwareMapping.addQuery('hardware_ci_status', current.configuration_item_status);
			grHardwareMapping.query();

			while (grHardwareMapping.next()) {
				similarRecordFound = true;

				if (grHardwareMapping.active.toString() !== 'true') {
					similarRecordInactive = true;
				} else {
					foundActive = true;
				}
			}

			if (foundActive.toString() === 'true') {
				return;
			}

			// No active 'both' → check split directional entries
			grHardwareMapping = new GlideRecord('alm_hardware_state_mapping');

			var assetToCI = grHardwareMapping.addQuery('synch_direction', 'asset_to_ci');
			assetToCI.addCondition('asset_state', current.asset_state);
			assetToCI.addCondition('asset_substate', current.asset_substate);

			var ciToAsset = grHardwareMapping.addQuery('synch_direction', 'ci_to_asset');
			ciToAsset.addCondition('hardware_ci_status', current.configuration_item_status);

			grHardwareMapping.addQuery(assetToCI.addOrCondition(ciToAsset));
			grHardwareMapping.query();

			while (grHardwareMapping.next()) {
				similarRecordFound = true;

				if (grHardwareMapping.active.toString() !== 'true') {
					similarRecordInactive = true;
				} else {
					foundActive = true;
				}
			}
		} else {
			// Single-direction logic
			if (current.synch_direction.toString() === 'asset_to_ci') {
				grHardwareMapping.addQuery('asset_state', current.asset_state);
				grHardwareMapping.addQuery('asset_substate', current.asset_substate);
				grHardwareMapping.addQuery('synch_direction', 'IN', 'both,asset_to_ci');
			} else if (current.synch_direction.toString() === 'ci_to_asset') {
				grHardwareMapping.addQuery('hardware_ci_status', current.configuration_item_status);
				grHardwareMapping.addQuery('synch_direction', 'IN', 'both,ci_to_asset');
			}

			grHardwareMapping.query();

			while (grHardwareMapping.next()) {
				similarRecordFound = true;

				if (grHardwareMapping.active.toString() !== 'true') {
					similarRecordInactive = true;
				} else {
					foundActive = true;
				}
			}
		}

		// Final messages
		if (similarRecordFound.toString() === 'false') {
			gs.addInfoMessage(gs.getMessage('Add similar entry in Asset CI Hardware Mapping table'));
		} else if (similarRecordInactive.toString() === 'true') {
			gs.addInfoMessage(gs.getMessage('Activate the similar record in the Asset CI Hardware Mapping table'));
		}
	} catch (e) {
		gs.error('Error in Asset-CI State Mapping BR: ' + e.message);
	}
}(current, previous));
