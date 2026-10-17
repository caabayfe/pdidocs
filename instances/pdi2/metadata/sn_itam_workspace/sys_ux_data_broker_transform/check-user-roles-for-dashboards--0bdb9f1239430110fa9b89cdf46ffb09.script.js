function transform() {
	var result = {
		hasAccessToAsset: true,
		hasAccessToModel: true,
		hasAccessToInventory: true,
		hasAccessToContract: true,
	};
	assetDashboardRoles = ['inventory_user', 'asset', 'inventory_admin', 'sam_admin', 'sam_user', 'ham_admin', 'itil'];
	inventoryDashboardRoles = ['ham_admin', 'inventory_user', 'inventory_admin', 'asset'];
	modelDashboardRoles = ['ham_admin', 'sam', 'catalog_admin', 'model_manager', 'asset', 'itil', 'catalog_manager'];
	contractDashboardRoles = ['asset', 'contract_manager'];

	result['hasAccessToAsset'] = !gs.hasRole(assetDashboardRoles);
	result['hasAccessToModel'] = !gs.hasRole(modelDashboardRoles);
	result['hasAccessToInventory'] = !gs.hasRole(inventoryDashboardRoles);
	result['hasAccessToContract'] = !gs.hasRole(contractDashboardRoles);

	return result;
}
