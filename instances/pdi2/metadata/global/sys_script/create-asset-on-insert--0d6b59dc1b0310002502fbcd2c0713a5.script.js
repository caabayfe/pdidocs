if (gs.getProperty(AssetandCI.ASSET_ASYNC_PROPERTY) === 'true') {
	if (AssetandCI.isAssetRequiredForCI(current)) {
		AssetandCI.createAssetQueueRecord(current.getValue('sys_id'), current.getValue('sys_class_name'), current.getValue('sys_domain'));
	}
} else {
	var ca = new AssetandCI();
	ca.createAsset(current);
}
