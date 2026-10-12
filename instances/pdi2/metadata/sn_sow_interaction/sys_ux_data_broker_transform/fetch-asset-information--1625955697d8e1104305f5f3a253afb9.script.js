function transform(input) {
	var output = {};
	var assetGr = new GlideRecord('alm_asset');
	assetGr.addQuery('assigned_to', input.openedForSysId);
	assetGr.addNotNullQuery('assigned_to');
	assetGr.addQuery('assigned_to', '!=', '5136503cc611227c0183e96598c4f706');
	assetGr.addQuery('install_status', '!=', 7);
	assetGr.query();
	var numberOfAssets = assetGr.getRowCount();
	var assets = [];
	while(assetGr.next() && assets.length < 5 ) {
		var asset = {
			assetName : assetGr.getValue('display_name'),
			sysId: assetGr.getValue('sys_id')
		};
		assets.push(asset);
	}
		
	output.numberOfAssets = numberOfAssets;
	output.assets = assets;
	
	return output;
}
