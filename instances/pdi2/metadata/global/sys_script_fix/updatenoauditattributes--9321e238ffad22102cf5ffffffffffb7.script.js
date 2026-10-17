(function executeFixScript() {
	var tablesConfig = {
		alm_asset: {
			fieldsToRemoveNoAudit: [
				'retired', 'display_name', 'request_line', 'model', 'model_category', 'location', 'ci', 'stockroom',
				'purchase_date', 'warranty_expiration', 'retirement_date', 'asset_tag', 'po_number', 'mac_addr',
				'serial_number', 'assigned_to',
			],
			fieldsToAddNoAudit: [
				'cmn_asset_tco', 'monthly_lease_payment', 'cmn_monthly_lease_payment', 'disposal_vendor',
				'like_kind_exchange', 'refresh_request_line', 'attestation_number', 'lease_contract',
				'sn_itam_comm_resale_order_num', 'attested_by', 'audit_number', 'sn_itam_common_audit_number',
				'model_component_id', 'audited_by', 'sn_itam_common_audited_by', 'last_audit_date',
				'sn_itam_common_last_audit_date', 'sn_itam_common_last_audit_state', 'cmn_asset_tco_benchmark_status',
				'last_attestation_state', 'last_audit_state', 'last_attestation_date', 'lease_expiration_date',
				'vendor_disposal_order_id', 'audit_type', 'sn_itam_common_audit_type', 'cmn_end_of_useful_life',
				'cmn_first_used', 'cmn_last_used', 'sys_domain_path', 'cmn_lease_term_months',
			],
		},
		alm_hardware: {
			fieldsToRemoveNoAudit: [
				'phone_number', 'imei', 'mac_address', 'eligible_for_refresh',
			],
			fieldsToAddNoAudit: [
				'last_enrolled', 'ownership', 'device_activated', 'platform', 'enrollment_state',
				'pre_enrollment_id', 'enrollment_name', 'enrollment_id',
			],
		},
		alm_pallet: {
			fieldsToRemoveNoAudit: ['pallet_number'],
			fieldsToAddNoAudit: [],
		},
		alm_consumable: {
			fieldsToRemoveNoAudit: [],
			fieldsToAddNoAudit: ['planned_for_disposal'],
		},
	};

	for (var tableName in tablesConfig) {
		var config = tablesConfig[tableName];

		// Remove no_audit=true
		if (config.fieldsToRemoveNoAudit && config.fieldsToRemoveNoAudit.length > 0) {
			var removeGR = new GlideRecord('sys_dictionary');
			removeGR.addQuery('name', tableName);
			removeGR.addQuery('element', 'IN', config.fieldsToRemoveNoAudit.join(','));
			removeGR.query();
			while (removeGR.next()) {
				var attrVal = removeGR.getValue('attributes');
				if (!gs.nil(attrVal) && attrVal.indexOf('no_audit=true') > -1) {
					var attrArrayRemove = attrVal.split(',').map(function(item) {
						return item.trim();
					});
					var filteredArray = attrArrayRemove.filter(function(item) {
						return item !== 'no_audit=true';
					});
					var updatedAttr = filteredArray.join(',');
					removeGR.setValue('attributes', updatedAttr);
					removeGR.update();
				}
			}
		}

		// Add no_audit=true
		if (config.fieldsToAddNoAudit && config.fieldsToAddNoAudit.length > 0) {
			var addGR = new GlideRecord('sys_dictionary');
			addGR.addQuery('name', tableName);
			addGR.addQuery('element', 'IN', config.fieldsToAddNoAudit.join(','));
			addGR.query();
			while (addGR.next()) {
				var existingAttr = addGR.getValue('attributes');
				var attrArrayAdd = [];

				if (!gs.nil(existingAttr) && existingAttr.length > 0) {
					attrArrayAdd = existingAttr.split(',').map(function(item) {
						return item.trim();
					});
				}

				if (attrArrayAdd.indexOf('no_audit=true') === -1) {
					attrArrayAdd.push('no_audit=true');
					var newAttrVal = attrArrayAdd.join(',');
					addGR.setValue('attributes', newAttrVal);
					addGR.update();
				}
			}
		}
	}
}());
