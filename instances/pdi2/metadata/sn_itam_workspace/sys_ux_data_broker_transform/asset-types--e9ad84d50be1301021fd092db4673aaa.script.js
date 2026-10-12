function transform(input) {
	var assetTypes = [
		{id: 'hardware', label: gs.getMessage('Hardware')},
		{id: 'consumable', label: gs.getMessage('Consumable')},
		{id: 'license', label: gs.getMessage('License')},
		{id: 'facility', label: gs.getMessage('Facility')}
	];
	var results = [];
	
	if(AssetWorkspaceUtil.isHAMActive()) {
		assetTypes.push({id: 'bundle', label: gs.getMessage('Bundle')});
	}
	
	if(AssetWorkspaceUtil.isSamActive()){
		assetTypes = assetTypes.filter(function(item) {
			return item.id !== 'license';
		});
	}
	
	if (global.AssetUtils.IS_ITAM_COMMON_ACTIVE && sn_itam_common.ITAMCommonPalletsUtil) {
		assetTypes.push({id: 'pallet', label: gs.getMessage('Pallet')});
	}
	
	for(var i = 0; i < assetTypes.length; i++){
		var data = {};
		data['id'] = assetTypes[i].id;
		data['label'] = assetTypes[i].label;
		data['checked'] = false;
		results.push(data);
	}
	results[0].checked = true;
	
	return results;
}
