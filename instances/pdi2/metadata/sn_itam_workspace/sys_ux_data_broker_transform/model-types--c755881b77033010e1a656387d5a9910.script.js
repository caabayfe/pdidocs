function transform(input) {
    var tables = [gs.getMessage('cmdb_application_product_model'), gs.getMessage('cmdb_model_bundle'), gs.getMessage('cmdb_consumable_product_model'), gs.getMessage('cmdb_contract_product_model'), gs.getMessage('cmdb_facility_product_model'), gs.getMessage('cmdb_hardware_product_model'), gs.getMessage('cmdb_service_product_model')];
    var displayNames = [gs.getMessage('Application'), gs.getMessage('Bundle'), gs.getMessage('Consumable'), gs.getMessage('Contract'), gs.getMessage('Facility'), gs.getMessage('Hardware'), gs.getMessage('Service')];
    var results = [];
    if (!AssetWorkspaceUtil.isSamActive()) {
        tables.push(gs.getMessage('cmdb_software_product_model'));
        displayNames.push(gs.getMessage('Software'));
    }
	if (global.AssetUtils.IS_ITAM_COMMON_ACTIVE && sn_itam_common.ITAMCommonPalletsUtil) {
		tables.push(gs.getMessage('cmdb_model_pallet'));
        displayNames.push(gs.getMessage('Pallet'));
	}
    for (var i = 0; i < tables.length; i++) {
        var data = {};
        data['id'] = tables[i];
        data['label'] = displayNames[i];
        data['checked'] = false;
        results.push(data);
    }
    results[0].checked = true;

    return results;
}
