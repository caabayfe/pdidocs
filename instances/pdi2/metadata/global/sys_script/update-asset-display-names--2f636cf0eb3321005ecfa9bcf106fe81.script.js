updateAssets(current);

function updateAssets(current) {
	var asset = new GlideRecord("alm_asset");
	asset.addQuery("model", current.sys_id);
	asset.query();
	while (asset.next()) {
		if (new AssetUtils().calculateDisplayName(asset))
			asset.update();
	}
}
