(function executeRule(current, previous) {
	try {
		if (current.active.toString() !== 'true') {
			return;
		}

		var similarRecordFound = false;
		var similarRecordInactive = false;
		var foundActive = false;

		var grAssetCIMapping = new GlideRecord('alm_asset_ci_state_mapping');

		if (current.synch_direction.toString() === 'both') {
			// Check for a single 'both' entry
			grAssetCIMapping.addQuery('synch_direction', 'both');
			grAssetCIMapping.addQuery('asset_state', current.asset_state);
			grAssetCIMapping.addQuery('asset_substate', current.asset_substate);
			grAssetCIMapping.addQuery('configuration_item_status', current.hardware_ci_status);
			grAssetCIMapping.query();

			while (grAssetCIMapping.next()) {
				similarRecordFound = true;

				if (grAssetCIMapping.active.toString() !== 'true') {
					similarRecordInactive = true;
				} else {
					foundActive = true;
				}
			}

			if (foundActive.toString() === 'true') {
				return;
			}

			// If no 'both' entry, check directional entries
			grAssetCIMapping = new GlideRecord('alm_asset_ci_state_mapping');

			var assetToCI = grAssetCIMapping.addQuery('synch_direction', 'asset_to_ci');
			assetToCI.addCondition('asset_state', current.asset_state);
			assetToCI.addCondition('asset_substate', current.asset_substate);

			var ciToAsset = grAssetCIMapping.addQuery('synch_direction', 'ci_to_asset');
			ciToAsset.addCondition('configuration_item_status', current.hardware_ci_status);

			grAssetCIMapping.addQuery(assetToCI.addOrCondition(ciToAsset));
			grAssetCIMapping.query();

			while (grAssetCIMapping.next()) {
				similarRecordFound = true;

				if (grAssetCIMapping.active.toString() !== 'true') {
					similarRecordInactive = true;
				} else {
					foundActive = true;
				}
			}
		} else {
			// Handle single direction
			if (current.synch_direction.toString() === 'asset_to_ci') {
				grAssetCIMapping.addQuery('asset_state', current.asset_state);
				grAssetCIMapping.addQuery('asset_substate', current.asset_substate);
				grAssetCIMapping.addQuery('synch_direction', 'IN', 'both,asset_to_ci');
			} else if (current.synch_direction.toString() === 'ci_to_asset') {
				grAssetCIMapping.addQuery('configuration_item_status', current.hardware_ci_status);
				grAssetCIMapping.addQuery('synch_direction', 'IN', 'both,ci_to_asset');
			}

			grAssetCIMapping.query();

			while (grAssetCIMapping.next()) {
				similarRecordFound = true;

				if (grAssetCIMapping.active.toString() !== 'true') {
					similarRecordInactive = true;
				} else {
					foundActive = true;
				}
			}
		}

		// Final message conditions
		if (similarRecordFound.toString() === 'false') {
			gs.addInfoMessage(gs.getMessage('Consider adding a similar entry to Asset-CI install status mapping table'));
		} else if (similarRecordInactive.toString() === 'true') {
			gs.addInfoMessage(gs.getMessage('Consider activating the similar record in Asset-CI install status mapping table'));
		}
	} catch (e) {
		gs.error('Error in Hardware State Mapping BR: ' + e.message);
	}
}(current, previous));
