var ITAMScopeTableAccess = Class.create();
ITAMScopeTableAccess.prototype = {
	initialize: function() {},

	type: 'ITAMScopeTableAccess',
};

ITAMScopeTableAccess.whitelistedTables = [
	'samp_ilmt_connection_health',
	'ilmt_v2_product_usage',
	'samp_remediation_result',
	'samp_entitlement_result',
	'alm_asset',
	'asset_reclamation_request',
	'cmdb_hardware_model_lifecycle',
	'cmdb_consumable_model_lifecycle',
	'cmdb_hardware_product_model',
	'cmdb_consumable_product_model',
	'cmdb_model_category',
	'cmdb_sam_sw_discovery_model',
	'proc_po',
	'proc_po_item',
	'sam_sw_product_lifecycle_report',
	'sam_vul_sw_m2m_disc_model',
	'samp_entitlement_import',
	'ast_contract',
	'change_request',
	'cds_client_schedule',
	'alm_transfer_order_line',
	'sn_itam_common_ship_task',
	'sn_itam_common_selection_task',
	// HAM Tables
	'sn_hamp_hw_refresh_line_task',
	'sn_hamp_loaner_asset_order',
	'sn_hamp_loaner_asset_task',
	'sn_hamp_custom_hw_prod_model',
	'sn_hamp_hw_product',
	'sn_hamp_hw_product_model',
	'sn_hamp_hw_device_type',
	'sn_hamp_hw_manufacturer',
	'sn_hamp_asset_reclaim_task',
	'sn_hamp_asset_reclaim_line',
	'sn_hamp_contract_asset_task',
	'sn_hamp_hardware_disposal',
	'sn_hamp_rma_request_line',
	// EAM Tables
	'sn_eam_loaner_asset_order',
	'sn_ent_model',
	'sn_eam_model_lifecycle',
	'sn_eam_cd_custom_model_library',
	'sn_eam_cd_model_type',
	'sn_eam_cd_manufacturer',
	'sn_eam_cd_product_model',
	'sn_eam_cd_model_library',
	// SAAS Tables
	'samp_sw_subscription_product_definition',
	'sam_saas_consumption_summary',
	'samp_sso_application',
	'samp_sw_subscription',
	'samp_sw_subscription_profile',
	'samp_sw_reclamation_candidate',
	'samp_m2m_rule_product',
	'cmdb_software_product_model',
	'samp_sso_integration_profile',
];
ITAMScopeTableAccess.checkTableAccess = function(gr) {
	var tableName = gr.getTableName();
	// Get list of tables in the hierarchy
	var hierarchyTables = ITAMScopeTableAccess.getHierarchy(tableName);
	for (var i = 0; i < hierarchyTables.length; i++) {
		// Check if the table is already whitelisted
		if (ITAMScopeTableAccess.whitelistedTables.indexOf(String(hierarchyTables[i])) > -1) {
			return true;
		}
		// Check if attribute - 'internal_itam_scope_access' is set at table dictionary level
		var tableGR = new GlideRecord(hierarchyTables[i]);
		var accessAttribute = tableGR.getAttribute('internal_itam_scope_access');
		if (accessAttribute === 'true') {
			return true;
		}
		if (accessAttribute === 'false') {
			return false;
		}
	}
	return false;
};
ITAMScopeTableAccess.getHierarchy = function(table) {
	var gth = new TableUtils(table);
	var hierarchyTableList = gth.getTables();
	var hierarchyTables = [];
	for (var i = 0; i < hierarchyTableList.size(); i++) {
		hierarchyTables.push(hierarchyTableList.get(i));
	}
	return hierarchyTables;
};
