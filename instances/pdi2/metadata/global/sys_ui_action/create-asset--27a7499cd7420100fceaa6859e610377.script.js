if(current.canWrite()) {
	var ca = new AssetandCI();
	ca.createAssetByPass(current, true);
	current.update();
}
